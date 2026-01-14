'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { ChevronLeft, ChevronRight, Plus, UserPlus, Check, Search, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  useCalendarBookings,
  useProperties,
  useClients,
  createCalendarBooking,
  createClient,
} from '@/hooks/use-calendar'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'

const MONTHS = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
]

const statusColors = {
  confirmed: 'bg-[#2d5a47] hover:bg-[#234a3a]',
  pending: 'bg-[#d4a853] hover:bg-[#c49943]',
  cancelled: 'bg-[#c53030] hover:bg-[#a52828]',
  blocked: 'bg-[#9ca3af] hover:bg-[#8b929b]',
}

type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'blocked'

export function FullCalendar() {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isDragging, setIsDragging] = useState(false)
  const [dragState, setDragState] = useState<{
    propertyId: string
    startDay: number
    endDay: number
  } | null>(null)
  const [showModal, setShowModal] = useState(false)

  const [isCalculating, setIsCalculating] = useState(false)

  const [newBooking, setNewBooking] = useState({
    clientId: null as string | null,
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    status: 'pending' as BookingStatus,
    isNewClient: false,
    adults: 2,
    children: 0,
    basePrice: 0,
    cleaningFee: 0,
    taxes: 0,
    discount: 0,
    discountType: '' as string,
    hasLinens: false,
    linensPrice: 0,
    hasCleaning: false,
    cleaningPrice: 0,
    hasCancellationInsurance: false,
    insuranceFee: 0,
    specialRequests: '',
  })
  const [selectedBooking, setSelectedBooking] = useState<(typeof bookings)[number] | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [clientSearch, setClientSearch] = useState('')
  const [showClientDropdown, setShowClientDropdown] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() + 1
  const {
    bookings,
    isLoading: bookingsLoading,
    mutate: mutateBookings,
  } = useCalendarBookings(year, month)
  const { properties, isLoading: propertiesLoading } = useProperties()
  const { clients, isLoading: clientsLoading, mutate: mutateClients } = useClients()

  const displayMonth = currentDate.getMonth()
  const displayYear = currentDate.getFullYear()
  const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate()
  const today = new Date()
  const isCurrentMonth = today.getMonth() === displayMonth && today.getFullYear() === displayYear
  const todayDay = isCurrentMonth ? today.getDate() : null

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const prevMonth = () => setCurrentDate(new Date(displayYear, displayMonth - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(displayYear, displayMonth + 1, 1))

  const getDayOfWeek = (day: number) => {
    return new Date(displayYear, displayMonth, day).getDay()
  }

  const isWeekend = (day: number) => {
    const dow = getDayOfWeek(day)
    return dow === 0 || dow === 6
  }

  const getBookingsForProperty = (propertyId: string) => {
    return bookings.filter((b) => b.propertyId === propertyId)
  }

  const isDayOccupied = useCallback(
    (propertyId: string, day: number) => {
      return bookings.some(
        (b) => b.propertyId === propertyId && day >= b.startDay && day <= b.endDay,
      )
    },
    [bookings],
  )

  const handleMouseDown = (propertyId: string, day: number) => {
    if (isDayOccupied(propertyId, day)) return
    setIsDragging(true)
    setDragState({ propertyId, startDay: day, endDay: day })
  }

  const handleMouseEnter = useCallback(
    (propertyId: string, day: number) => {
      if (!isDragging || !dragState) return
      if (propertyId !== dragState.propertyId) return

      const minDay = Math.min(dragState.startDay, day)
      const maxDay = Math.max(dragState.startDay, day)

      let hasConflict = false
      for (let d = minDay; d <= maxDay; d++) {
        if (isDayOccupied(propertyId, d)) {
          hasConflict = true
          break
        }
      }

      if (!hasConflict) {
        setDragState({ ...dragState, endDay: day })
      }
    },
    [isDragging, dragState, isDayOccupied],
  )

  const calculatePrices = async (startDate: Date, endDate: Date, options = {}) => {
    setIsCalculating(true)
    try {
      const currentOptions = {
        adults: newBooking.adults,
        children: newBooking.children,
        hasLinens: newBooking.hasLinens,
        hasCleaning: newBooking.hasCleaning,
        hasCancellationInsurance: newBooking.hasCancellationInsurance,
        ...options,
      }

      const response = await fetch('/api/bookings/calculate-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          ...currentOptions,
        }),
      })

      if (response.ok) {
        const prices = await response.json()
        setNewBooking((prev) => ({
          ...prev,
          ...currentOptions,
          basePrice: prices.basePrice,
          cleaningFee: prices.cleaningPrice,
          taxes: prices.touristTax,
          linensPrice: prices.linensPrice,
          cleaningPrice: prices.cleaningPrice,
          insuranceFee: prices.insuranceFee,
          discount: prices.discount,
        }))
      }
    } catch (error) {
      console.error('Price calculation error', error)
    } finally {
      setIsCalculating(false)
    }
  }

  const handleMouseUp = () => {
    if (isDragging && dragState) {
      const start = Math.min(dragState.startDay, dragState.endDay)
      const end = Math.max(dragState.startDay, dragState.endDay)

      setDragState({ ...dragState, startDay: start, endDay: end })
      setShowModal(true)

      const startDate = new Date(displayYear, displayMonth, start)
      const endDate = new Date(displayYear, displayMonth, end)
      calculatePrices(startDate, endDate)
    }
    setIsDragging(false)
  }

  const handleOptionChange = (key: string, value: any) => {
    setNewBooking((prev) => {
      const updated = { ...prev, [key]: value }
      if (dragState) {
        const start = Math.min(dragState.startDay, dragState.endDay)
        const end = Math.max(dragState.startDay, dragState.endDay)
        const startDate = new Date(displayYear, displayMonth, start)
        const endDate = new Date(displayYear, displayMonth, end)

        calculatePrices(startDate, endDate, { [key]: value })
      }
      return updated
    })
  }

  const filteredClients = clients.filter(
    (client) =>
      `${client.firstName} ${client.lastName}`.toLowerCase().includes(clientSearch.toLowerCase()) ||
      client.email.toLowerCase().includes(clientSearch.toLowerCase()),
  )

  const showCreateClientOption =
    clientSearch.trim() !== '' &&
    !filteredClients.some(
      (c) => `${c.firstName} ${c.lastName}`.toLowerCase() === clientSearch.toLowerCase(),
    )

  const handleSelectClient = (client: (typeof clients)[number]) => {
    setNewBooking((prev) => ({
      ...prev,
      clientId: client.id,
      clientName: `${client.firstName} ${client.lastName}`,
      clientEmail: client.email,
      clientPhone: client.phone || '',
      isNewClient: false,
    }))
    setClientSearch(`${client.firstName} ${client.lastName}`)
    setShowClientDropdown(false)
  }

  const handleCreateNewClient = () => {
    setNewBooking((prev) => ({
      ...prev,
      clientId: null,
      clientName: clientSearch,
      clientEmail: '',
      clientPhone: '',
      isNewClient: true,
    }))
    setShowClientDropdown(false)
  }

  const handleConfirmBooking = async () => {
    if (!dragState || !newBooking.clientName.trim()) return
    setIsSubmitting(true)

    try {
      const start = Math.min(dragState.startDay, dragState.endDay)
      const end = Math.max(dragState.startDay, dragState.endDay)

      let clientId = newBooking.clientId

      if (newBooking.isNewClient && newBooking.clientName.trim()) {
        const [firstName, ...lastNameParts] = newBooking.clientName.trim().split(' ')
        const lastName = lastNameParts.join(' ') || firstName

        const newClient = await createClient({
          firstName,
          lastName,
          email: newBooking.clientEmail,
          phone: newBooking.clientPhone,
        })

        clientId = newClient.id
        await mutateClients()
      }

      if (!clientId) {
        toast({
          title: 'Error',
          description: 'Please select or create a client',
          variant: 'destructive',
        })
        return
      }

      const startDate = new Date(displayYear, displayMonth, start)
      const endDate = new Date(displayYear, displayMonth, end)

      const totalPrice =
        (newBooking.basePrice || 0) +
        (newBooking.cleaningFee || 0) +
        (newBooking.taxes || 0) +
        (newBooking.linensPrice || 0) +
        (newBooking.insuranceFee || 0) -
        (newBooking.discount || 0)

      await createCalendarBooking({
        propertyId: dragState.propertyId,
        clientId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        status: newBooking.status,
        totalPrice,
        basePrice: newBooking.basePrice,
        cleaningFee: newBooking.cleaningFee,
        taxes: newBooking.taxes,
        adults: newBooking.adults,
        children: newBooking.children,
        specialRequests: newBooking.specialRequests,
        discount: newBooking.discount,
        discountType: newBooking.discountType,
        hasLinens: newBooking.hasLinens,
        linensPrice: newBooking.linensPrice,
        hasCleaning: newBooking.hasCleaning,
        cleaningPrice: newBooking.cleaningPrice,
        hasCancellationInsurance: newBooking.hasCancellationInsurance,
        insuranceFee: newBooking.insuranceFee,
      })

      await mutateBookings()

      toast({
        title: 'Réservation créée',
        description: 'La réservation a été créée avec succès',
      })

      setShowModal(false)
      setDragState(null)
      setNewBooking({
        clientId: null,
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        status: 'pending',
        isNewClient: false,
        adults: 2,
        children: 0,
        basePrice: 0,
        cleaningFee: 0,
        taxes: 0,
        discount: 0,
        discountType: '',
        hasLinens: false,
        linensPrice: 0,
        hasCleaning: false,
        cleaningPrice: 0,
        hasCancellationInsurance: false,
        insuranceFee: 0,
        specialRequests: '',
      })
      setClientSearch('')
    } catch (error) {
      console.error('Error creating booking:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible de créer la réservation',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelModal = () => {
    setShowModal(false)
    setDragState(null)
    setNewBooking({
      clientId: null,
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      status: 'pending',
      isNewClient: false,
      adults: 2,
      children: 0,
      basePrice: 0,
      cleaningFee: 0,
      taxes: 0,
      discount: 0,
      discountType: '',
      hasLinens: false,
      linensPrice: 0,
      hasCleaning: false,
      cleaningPrice: 0,
      hasCancellationInsurance: false,
      insuranceFee: 0,
      specialRequests: '',
    })
    setClientSearch('')
  }

  const showSelectionPreview = (propertyId: string, day: number) => {
    if (!dragState || dragState.propertyId !== propertyId) return false
    const start = Math.min(dragState.startDay, dragState.endDay)
    const end = Math.max(dragState.startDay, dragState.endDay)
    return day >= start && day <= end
  }

  if (bookingsLoading || propertiesLoading || clientsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col space-y-4">
      <div className="flex shrink-0 items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={prevMonth}
            className="rounded-xl bg-transparent"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="min-w-[180px] text-center text-lg font-semibold">
            {MONTHS[displayMonth]} {displayYear}
          </h2>
          <Button
            variant="outline"
            size="icon"
            onClick={nextMonth}
            className="rounded-xl bg-transparent"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#2d5a47]" />
            <span className="text-muted-foreground">Confirmé</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#d4a853]" />
            <span className="text-muted-foreground">En attente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#9ca3af]" />
            <span className="text-muted-foreground">Bloqué</span>
          </div>
        </div>
      </div>

      <Card className="border-border flex flex-1 flex-col overflow-hidden border shadow-sm">
        <div
          ref={containerRef}
          className="flex-1 overflow-auto select-none"
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div className="flex h-full min-w-[1200px] flex-col">
            <div className="border-border bg-muted/30 sticky top-0 z-10 flex border-b">
              <div className="border-border bg-muted/30 w-52 shrink-0 border-r p-3">
                <span className="text-muted-foreground text-sm font-medium">Propriétés</span>
              </div>
              <div className="flex flex-1">
                {days.map((day) => (
                  <div
                    key={day}
                    className={cn(
                      'border-border bg-muted/30 min-w-9 flex-1 border-r p-2 text-center last:border-r-0',
                      isWeekend(day) && 'bg-muted/50',
                      todayDay === day && 'bg-primary/10',
                    )}
                  >
                    <span
                      className={cn(
                        'text-xs font-medium',
                        todayDay === day
                          ? 'text-primary'
                          : isWeekend(day)
                            ? 'text-muted-foreground'
                            : 'text-foreground',
                      )}
                    >
                      {day}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1">
              {properties.map((property) => {
                const propertyBookings = getBookingsForProperty(property.id)

                return (
                  <div
                    key={property.id}
                    className="border-border hover:bg-muted/20 flex border-b transition-colors last:border-b-0"
                  >
                    <div className="border-border bg-card sticky left-0 z-10 w-52 shrink-0 border-r p-3">
                      <div>
                        <p className="text-foreground text-sm font-medium">{property.name}</p>
                        <p className="text-muted-foreground truncate text-xs">
                          {property.address || 'Sans adresse'}
                        </p>
                      </div>
                    </div>

                    <div className="relative flex flex-1">
                      {days.map((day) => {
                        const isOccupied = isDayOccupied(property.id, day)
                        const isSelecting = showSelectionPreview(property.id, day)

                        return (
                          <div
                            key={day}
                            className={cn(
                              'border-border h-14 min-w-9 flex-1 cursor-pointer border-r transition-colors last:border-r-0',
                              isWeekend(day) && 'bg-muted/30',
                              !isOccupied && !isSelecting && 'hover:bg-accent/50',
                              isSelecting && 'bg-primary/20',
                            )}
                            onMouseDown={() => handleMouseDown(property.id, day)}
                            onMouseEnter={() => handleMouseEnter(property.id, day)}
                          />
                        )
                      })}

                      {propertyBookings.map((booking) => {
                        const leftPercent = ((booking.startDay - 1) / daysInMonth) * 100
                        const widthPercent =
                          ((booking.endDay - booking.startDay + 1) / daysInMonth) * 100

                        return (
                          <div
                            key={booking.id}
                            className={cn(
                              'absolute top-2 flex h-10 cursor-pointer items-center rounded-lg px-2 text-xs font-medium text-white shadow-sm transition-all hover:opacity-90',
                              statusColors[booking.status],
                            )}
                            style={{
                              left: `${leftPercent}%`,
                              width: `${widthPercent}%`,
                            }}
                            onClick={() => {
                              setSelectedBooking(booking)
                              setShowDetailsModal(true)
                            }}
                          >
                            <span className="truncate">{booking.clientName}</span>
                          </div>
                        )
                      })}

                      {dragState && dragState.propertyId === property.id && (
                        <div
                          className="border-primary bg-primary/10 absolute top-2 flex h-10 items-center justify-center rounded-lg border-2 border-dashed"
                          style={{
                            left: `${((Math.min(dragState.startDay, dragState.endDay) - 1) / daysInMonth) * 100}%`,
                            width: `${((Math.abs(dragState.endDay - dragState.startDay) + 1) / daysInMonth) * 100}%`,
                          }}
                        >
                          <Plus className="text-primary h-4 w-4" />
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </Card>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-[550px]">
          <DialogHeader className="shrink-0 p-6 pb-2">
            <DialogTitle className="text-lg">Nouvelle réservation</DialogTitle>
          </DialogHeader>

          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-2">
            {dragState && (
              <>
                <div className="bg-primary/5 border-primary/10 grid grid-cols-2 gap-4 rounded-lg border p-3 text-sm">
                  <div>
                    <span className="text-muted-foreground block text-xs">Propriété</span>
                    <span className="block truncate font-medium">
                      {properties.find((p) => p.id === dragState.propertyId)?.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">Dates</span>
                    <span className="block font-medium">
                      {Math.min(dragState.startDay, dragState.endDay)} -{' '}
                      {Math.max(dragState.startDay, dragState.endDay)} {MONTHS[displayMonth]}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Client</Label>
                  <div className="relative">
                    <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                      placeholder="Rechercher ou créer un client..."
                      value={clientSearch}
                      onChange={(e) => {
                        setClientSearch(e.target.value)
                        setShowClientDropdown(true)
                        if (newBooking.clientId) {
                          setNewBooking((prev) => ({
                            ...prev,
                            clientId: null,
                            clientName: '',
                            isNewClient: false,
                          }))
                        }
                      }}
                      onFocus={() => setShowClientDropdown(true)}
                      className="pl-9"
                    />

                    {showClientDropdown && (clientSearch || filteredClients.length > 0) && (
                      <div className="bg-card border-border absolute top-full right-0 left-0 z-50 mt-1 max-h-48 overflow-auto rounded-xl border shadow-lg">
                        {filteredClients.map((client) => (
                          <button
                            key={client.id}
                            type="button"
                            className="hover:bg-accent/50 flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors"
                            onClick={() => handleSelectClient(client)}
                          >
                            <div className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium">
                              {client.firstName.charAt(0)}
                              {client.lastName.charAt(0)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">
                                {client.firstName} {client.lastName}
                              </p>
                              <p className="text-muted-foreground truncate text-xs">
                                {client.email}
                              </p>
                            </div>
                            {newBooking.clientId === client.id && (
                              <Check className="text-primary h-4 w-4" />
                            )}
                          </button>
                        ))}

                        {showCreateClientOption && (
                          <>
                            <div className="border-border border-t" />
                            <button
                              type="button"
                              className="hover:bg-accent/50 flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors"
                              onClick={handleCreateNewClient}
                            >
                              <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-full">
                                <UserPlus className="text-primary-foreground h-4 w-4" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium">Créer &quot;{clientSearch}&quot;</p>
                                <p className="text-muted-foreground text-xs">Nouveau client</p>
                              </div>
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {newBooking.clientId && !newBooking.isNewClient && (
                    <div className="mt-1 flex items-center gap-2">
                      <span className="bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs">
                        <Check className="h-3 w-3" />
                        {newBooking.clientName}
                      </span>
                    </div>
                  )}

                  {newBooking.isNewClient && (
                    <div className="border-border bg-muted/30 mt-2 space-y-3 rounded-xl border p-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Email</Label>
                          <Input
                            type="email"
                            placeholder="email@exemple.com"
                            value={newBooking.clientEmail}
                            onChange={(e) =>
                              setNewBooking((prev) => ({ ...prev, clientEmail: e.target.value }))
                            }
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Téléphone</Label>
                          <Input
                            placeholder="06 12 34 56 78"
                            value={newBooking.clientPhone}
                            onChange={(e) =>
                              setNewBooking((prev) => ({ ...prev, clientPhone: e.target.value }))
                            }
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Statut</Label>
                    <Select
                      value={newBooking.status}
                      onValueChange={(value) =>
                        setNewBooking((prev) => ({ ...prev, status: value as BookingStatus }))
                      }
                    >
                      <SelectTrigger className="h-9 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">En attente</SelectItem>
                        <SelectItem value="confirmed">Confirmé</SelectItem>
                        <SelectItem value="blocked">Bloqué</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Invités</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          type="number"
                          min="1"
                          value={newBooking.adults}
                          onChange={(e) =>
                            handleOptionChange('adults', parseInt(e.target.value) || 1)
                          }
                          className="h-9 pr-8"
                        />
                        <span className="text-muted-foreground pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-xs">
                          Ad.
                        </span>
                      </div>
                      <div className="relative flex-1">
                        <Input
                          type="number"
                          min="0"
                          value={newBooking.children}
                          onChange={(e) =>
                            handleOptionChange('children', parseInt(e.target.value) || 0)
                          }
                          className="h-9 pr-8"
                        />
                        <span className="text-muted-foreground pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-xs">
                          Enf.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">
                      Détails Financiers{' '}
                      {isCalculating && <Loader2 className="ml-2 inline h-3 w-3 animate-spin" />}
                    </Label>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="hasLinens"
                        checked={newBooking.hasLinens}
                        onCheckedChange={(checked) => handleOptionChange('hasLinens', checked)}
                      />
                      <Label htmlFor="hasLinens" className="cursor-pointer font-normal">
                        Linge
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="hasCleaning"
                        checked={newBooking.hasCleaning}
                        onCheckedChange={(checked) => handleOptionChange('hasCleaning', checked)}
                      />
                      <Label htmlFor="hasCleaning" className="cursor-pointer font-normal">
                        Ménage
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="hasInsurance"
                        checked={newBooking.hasCancellationInsurance}
                        onCheckedChange={(checked) =>
                          handleOptionChange('hasCancellationInsurance', checked)
                        }
                      />
                      <Label htmlFor="hasInsurance" className="cursor-pointer font-normal">
                        Assurance
                      </Label>
                    </div>
                  </div>

                  <div className="bg-muted/20 grid grid-cols-3 gap-3 rounded-lg p-3">
                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs">Loyer (€)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={newBooking.basePrice}
                        onChange={(e) =>
                          setNewBooking((prev) => ({
                            ...prev,
                            basePrice: parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="bg-background h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs">Ménage (€)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={newBooking.cleaningFee}
                        onChange={(e) =>
                          setNewBooking((prev) => ({
                            ...prev,
                            cleaningFee: parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="bg-background h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs">Taxes (€)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={newBooking.taxes}
                        onChange={(e) =>
                          setNewBooking((prev) => ({
                            ...prev,
                            taxes: parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="bg-background h-8 text-sm"
                      />
                    </div>

                    {(newBooking.hasLinens || newBooking.linensPrice > 0) && (
                      <div className="space-y-1">
                        <Label className="text-muted-foreground text-xs">Linge (€)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={newBooking.linensPrice}
                          onChange={(e) =>
                            setNewBooking((prev) => ({
                              ...prev,
                              linensPrice: parseFloat(e.target.value) || 0,
                            }))
                          }
                          className="bg-background h-8 text-sm"
                        />
                      </div>
                    )}

                    {(newBooking.hasCancellationInsurance || newBooking.insuranceFee > 0) && (
                      <div className="space-y-1">
                        <Label className="text-muted-foreground text-xs">Assurance (€)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={newBooking.insuranceFee}
                          onChange={(e) =>
                            setNewBooking((prev) => ({
                              ...prev,
                              insuranceFee: parseFloat(e.target.value) || 0,
                            }))
                          }
                          className="bg-background h-8 text-sm"
                        />
                      </div>
                    )}

                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs">Réduction (€)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={newBooking.discount}
                        onChange={(e) =>
                          setNewBooking((prev) => ({
                            ...prev,
                            discount: parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="bg-background h-8 text-sm text-red-600"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Notes</Label>
                  <Textarea
                    placeholder="Notes..."
                    value={newBooking.specialRequests}
                    onChange={(e) =>
                      setNewBooking((prev) => ({ ...prev, specialRequests: e.target.value }))
                    }
                    className="min-h-[60px] resize-none rounded-xl text-sm"
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter className="shrink-0 gap-2 border-t p-6 pt-2">
            <Button
              variant="outline"
              onClick={handleCancelModal}
              className="rounded-xl bg-transparent"
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              onClick={handleConfirmBooking}
              disabled={!newBooking.clientName.trim() || isSubmitting}
              className="rounded-xl"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Créer la réservation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Détails de la réservation</DialogTitle>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs font-medium uppercase">
                    Client
                  </Label>
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium">
                      {selectedBooking.client?.firstName.charAt(0)}
                      {selectedBooking.client?.lastName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">
                        {selectedBooking.client?.firstName} {selectedBooking.client?.lastName}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {selectedBooking.client?.email}
                      </p>
                      {selectedBooking.client?.phone && (
                        <p className="text-muted-foreground text-xs">
                          {selectedBooking.client.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs font-medium uppercase">
                    Propriété
                  </Label>
                  <div>
                    <p className="font-medium">{selectedBooking.property?.name}</p>
                    {selectedBooking.property?.address && (
                      <p className="text-muted-foreground text-xs">
                        {selectedBooking.property.address}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs font-medium uppercase">
                    Arrivée
                  </Label>
                  <p className="font-medium">
                    {new Date(selectedBooking.startDate).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs font-medium uppercase">
                    Départ
                  </Label>
                  <p className="font-medium">
                    {new Date(selectedBooking.endDate).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs font-medium uppercase">
                    Statut
                  </Label>
                  <div>
                    {selectedBooking.status === 'confirmed' && (
                      <span className="bg-primary/10 text-primary inline-block rounded-full px-2.5 py-1 text-xs font-medium">
                        Confirmé
                      </span>
                    )}
                    {selectedBooking.status === 'pending' && (
                      <span className="inline-block rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-800">
                        En attente
                      </span>
                    )}
                    {selectedBooking.status === 'blocked' && (
                      <span className="inline-block rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-800">
                        Bloqué
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs font-medium uppercase">
                  Invités
                </Label>
                <p className="text-sm">
                  {selectedBooking.adults} adulte{selectedBooking.adults > 1 ? 's' : ''}
                  {selectedBooking.children > 0 &&
                    `, ${selectedBooking.children} enfant${selectedBooking.children > 1 ? 's' : ''}`}
                </p>
              </div>

              <div className="space-y-3">
                <Label className="text-muted-foreground text-xs font-medium uppercase">
                  Tarification
                </Label>
                <div className="bg-muted/30 space-y-2 rounded-xl p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Prix de base</span>
                    <span className="font-medium">{selectedBooking.basePrice.toFixed(2)} €</span>
                  </div>
                  {selectedBooking.cleaningFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Frais de ménage</span>
                      <span className="font-medium">
                        {selectedBooking.cleaningFee.toFixed(2)} €
                      </span>
                    </div>
                  )}
                  {selectedBooking.taxes > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Taxes</span>
                      <span className="font-medium">{selectedBooking.taxes.toFixed(2)} €</span>
                    </div>
                  )}
                  {selectedBooking.hasLinens && selectedBooking.linensPrice > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Linge de maison</span>
                      <span className="font-medium">
                        {selectedBooking.linensPrice.toFixed(2)} €
                      </span>
                    </div>
                  )}
                  {selectedBooking.hasCleaning && selectedBooking.cleaningPrice > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Ménage en cours de séjour</span>
                      <span className="font-medium">
                        {selectedBooking.cleaningPrice.toFixed(2)} €
                      </span>
                    </div>
                  )}
                  {selectedBooking.hasCancellationInsurance && selectedBooking.insuranceFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Assurance annulation</span>
                      <span className="font-medium">
                        {selectedBooking.insuranceFee.toFixed(2)} €
                      </span>
                    </div>
                  )}
                  {selectedBooking.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>
                        Réduction{' '}
                        {selectedBooking.discountType ? `(${selectedBooking.discountType})` : ''}
                      </span>
                      <span className="font-medium">-{selectedBooking.discount.toFixed(2)} €</span>
                    </div>
                  )}
                  <div className="border-border border-t pt-2">
                    <div className="flex justify-between">
                      <span className="font-semibold">Total</span>
                      <span className="text-lg font-bold">
                        {selectedBooking.totalPrice.toFixed(2)} €
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedBooking.specialRequests && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs font-medium uppercase">
                    Demandes spéciales
                  </Label>
                  <p className="bg-muted/30 rounded-xl p-3 text-sm">
                    {selectedBooking.specialRequests}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDetailsModal(false)}
              className="rounded-xl bg-transparent"
            >
              Fermer
            </Button>
            <Button
              onClick={() => {
                if (selectedBooking) {
                  router.push(`/bookings/${selectedBooking.id}`)
                }
              }}
              className="rounded-xl"
            >
              Voir la réservation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
