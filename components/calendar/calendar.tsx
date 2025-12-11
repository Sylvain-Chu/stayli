'use client'

import { useState, useRef, useCallback } from 'react'
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
import { ChevronLeft, ChevronRight, Plus, UserPlus, Check, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

// ... (Gardez les constantes MONTHS, properties, initialBookings, statusColors, statusLabels, existingClients comme avant)
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

const properties = [
  { id: 1, name: 'Villa Méditerranée', location: 'Nice, France' },
  { id: 2, name: 'Appartement Paris', location: 'Paris, France' },
  { id: 3, name: 'Chalet Montagne', location: 'Chamonix, France' },
  { id: 4, name: 'Studio Plage', location: 'Biarritz, France' },
  { id: 5, name: 'Maison Campagne', location: 'Provence, France' },
]

const initialBookings = [
  {
    id: 1,
    propertyId: 1,
    client: 'Marie Dupont',
    startDay: 5,
    endDay: 12,
    status: 'confirmed' as const,
  },
  {
    id: 2,
    propertyId: 2,
    client: 'Pierre Martin',
    startDay: 8,
    endDay: 15,
    status: 'confirmed' as const,
  },
  {
    id: 3,
    propertyId: 3,
    client: 'Sophie Bernard',
    startDay: 20,
    endDay: 27,
    status: 'pending' as const,
  },
  {
    id: 4,
    propertyId: 1,
    client: 'Jean Lefebvre',
    startDay: 15,
    endDay: 19,
    status: 'blocked' as const,
  },
  {
    id: 5,
    propertyId: 4,
    client: 'Claire Moreau',
    startDay: 3,
    endDay: 8,
    status: 'confirmed' as const,
  },
  {
    id: 6,
    propertyId: 5,
    client: 'Lucas Petit',
    startDay: 10,
    endDay: 14,
    status: 'pending' as const,
  },
]

const statusColors = {
  confirmed: 'bg-[#2d5a47] hover:bg-[#234a3a]',
  pending: 'bg-[#d4a853] hover:bg-[#c49943]',
  cancelled: 'bg-[#c53030] hover:bg-[#a52828]',
  blocked: 'bg-[#9ca3af] hover:bg-[#8b929b]',
}

type Booking = (typeof initialBookings)[number]

const existingClients = [
  { id: 1, name: 'Marie Dupont', email: 'marie.dupont@email.com', phone: '06 12 34 56 78' },
  { id: 2, name: 'Pierre Martin', email: 'pierre.martin@email.com', phone: '06 23 45 67 89' },
  { id: 3, name: 'Sophie Bernard', email: 'sophie.bernard@email.com', phone: '06 34 56 78 90' },
  { id: 4, name: 'Jean Lefebvre', email: 'jean.lefebvre@email.com', phone: '06 45 67 89 01' },
  { id: 5, name: 'Claire Moreau', email: 'claire.moreau@email.com', phone: '06 56 78 90 12' },
  { id: 6, name: 'Lucas Petit', email: 'lucas.petit@email.com', phone: '06 67 89 01 23' },
  { id: 7, name: 'Emma Richard', email: 'emma.richard@email.com', phone: '06 78 90 12 34' },
  { id: 8, name: 'Thomas Durand', email: 'thomas.durand@email.com', phone: '06 89 01 23 45' },
]

export function FullCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 11, 1))
  const [bookings, setBookings] = useState(initialBookings)
  const [isDragging, setIsDragging] = useState(false)
  const [dragState, setDragState] = useState<{
    propertyId: number
    startDay: number
    endDay: number
  } | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [newBooking, setNewBooking] = useState({
    clientId: null as number | null,
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    status: 'pending' as const,
    isNewClient: false,
  })
  const [clientSearch, setClientSearch] = useState('')
  const [showClientDropdown, setShowClientDropdown] = useState(false)
  const [clients, setClients] = useState(existingClients)
  const containerRef = useRef<HTMLDivElement>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()
  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year
  const todayDay = isCurrentMonth ? today.getDate() : null

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const getDayOfWeek = (day: number) => {
    return new Date(year, month, day).getDay()
  }

  const isWeekend = (day: number) => {
    const dow = getDayOfWeek(day)
    return dow === 0 || dow === 6
  }

  const getBookingsForProperty = (propertyId: number) => {
    return bookings.filter((b) => b.propertyId === propertyId)
  }

  // Memoized to be used in dependencies
  const isDayOccupied = useCallback(
    (propertyId: number, day: number) => {
      return bookings.some(
        (b) => b.propertyId === propertyId && day >= b.startDay && day <= b.endDay,
      )
    },
    [bookings],
  )

  const handleMouseDown = (propertyId: number, day: number) => {
    if (isDayOccupied(propertyId, day)) return
    setIsDragging(true)
    setDragState({ propertyId, startDay: day, endDay: day })
  }

  const handleMouseEnter = useCallback(
    (propertyId: number, day: number) => {
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
    [isDragging, dragState, isDayOccupied], // Added isDayOccupied to dependencies
  )

  // ... (Le reste du fichier reste identique, assurez-vous juste de bien copier le reste de la fonction et le JSX)
  const handleMouseUp = () => {
    if (isDragging && dragState) {
      const start = Math.min(dragState.startDay, dragState.endDay)
      const end = Math.max(dragState.startDay, dragState.endDay)
      setDragState({ ...dragState, startDay: start, endDay: end })
      setShowModal(true)
    }
    setIsDragging(false)
  }

  // ... (Code suivant inchangé jusqu'à la fin du composant)
  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
      client.email.toLowerCase().includes(clientSearch.toLowerCase()),
  )

  const showCreateClientOption =
    clientSearch.trim() !== '' &&
    !filteredClients.some((c) => c.name.toLowerCase() === clientSearch.toLowerCase())

  const handleSelectClient = (client: (typeof existingClients)[number]) => {
    setNewBooking({
      ...newBooking,
      clientId: client.id,
      clientName: client.name,
      clientEmail: client.email,
      clientPhone: client.phone,
      isNewClient: false,
    })
    setClientSearch(client.name)
    setShowClientDropdown(false)
  }

  const handleCreateNewClient = () => {
    setNewBooking({
      ...newBooking,
      clientId: null,
      clientName: clientSearch,
      clientEmail: '',
      clientPhone: '',
      isNewClient: true,
    })
    setShowClientDropdown(false)
  }

  const handleConfirmBooking = () => {
    if (!dragState || !newBooking.clientName.trim()) return

    const start = Math.min(dragState.startDay, dragState.endDay)
    const end = Math.max(dragState.startDay, dragState.endDay)

    if (newBooking.isNewClient && newBooking.clientName.trim()) {
      const newClient = {
        id: clients.length + 1,
        name: newBooking.clientName,
        email: newBooking.clientEmail,
        phone: newBooking.clientPhone,
      }
      setClients([...clients, newClient])
    }

    const newBookingEntry: Booking = {
      id: bookings.length + 1,
      propertyId: dragState.propertyId,
      client: newBooking.clientName,
      startDay: start,
      endDay: end,
      status: newBooking.status,
    }

    setBookings([...bookings, newBookingEntry])
    setShowModal(false)
    setDragState(null)
    setNewBooking({
      clientId: null,
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      status: 'pending',
      isNewClient: false,
    })
    setClientSearch('')
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
    })
    setClientSearch('')
  }

  const showSelectionPreview = (propertyId: number, day: number) => {
    if (!dragState || dragState.propertyId !== propertyId) return false
    const start = Math.min(dragState.startDay, dragState.endDay)
    const end = Math.max(dragState.startDay, dragState.endDay)
    return day >= start && day <= end
  }

  return (
    <div className="space-y-4">
      {/* ... (JSX Header identique) */}
      <div className="flex items-center justify-between">
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
            {MONTHS[month]} {year}
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

      {/* Calendar Grid */}
      <Card className="border-border overflow-hidden border shadow-sm">
        <div
          ref={containerRef}
          className="overflow-x-auto select-none"
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div className="min-w-[1200px]">
            {/* Days Header */}
            <div className="border-border bg-muted/30 flex border-b">
              <div className="border-border w-52 flex-shrink-0 border-r p-3">
                <span className="text-muted-foreground text-sm font-medium">Propriétés</span>
              </div>
              <div className="flex flex-1">
                {days.map((day) => (
                  <div
                    key={day}
                    className={cn(
                      'border-border min-w-[36px] flex-1 border-r p-2 text-center last:border-r-0',
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

            {/* Property Rows */}
            {properties.map((property) => {
              const propertyBookings = getBookingsForProperty(property.id)

              return (
                <div
                  key={property.id}
                  className="border-border hover:bg-muted/20 flex border-b transition-colors last:border-b-0"
                >
                  {/* Property Info */}
                  <div className="border-border w-52 flex-shrink-0 border-r p-3">
                    <div>
                      <p className="text-foreground text-sm font-medium">{property.name}</p>
                      <p className="text-muted-foreground text-xs">{property.location}</p>
                    </div>
                  </div>

                  {/* Days Grid */}
                  <div className="relative flex flex-1">
                    {days.map((day) => {
                      const isOccupied = isDayOccupied(property.id, day)
                      const isSelecting = showSelectionPreview(property.id, day)

                      return (
                        <div
                          key={day}
                          className={cn(
                            'border-border h-14 min-w-[36px] flex-1 cursor-pointer border-r transition-colors last:border-r-0',
                            isWeekend(day) && 'bg-muted/30',
                            !isOccupied && !isSelecting && 'hover:bg-accent/50',
                            isSelecting && 'bg-primary/20',
                          )}
                          onMouseDown={() => handleMouseDown(property.id, day)}
                          onMouseEnter={() => handleMouseEnter(property.id, day)}
                        />
                      )
                    })}

                    {/* Booking Bars */}
                    {propertyBookings.map((booking) => {
                      const leftPercent = ((booking.startDay - 1) / daysInMonth) * 100
                      const widthPercent =
                        ((booking.endDay - booking.startDay + 1) / daysInMonth) * 100

                      return (
                        <div
                          key={booking.id}
                          className={cn(
                            'absolute top-2 flex h-10 cursor-pointer items-center rounded-lg px-2 text-xs font-medium text-white shadow-sm transition-all',
                            statusColors[booking.status],
                          )}
                          style={{
                            left: `${leftPercent}%`,
                            width: `${widthPercent}%`,
                          }}
                        >
                          <span className="truncate">{booking.client}</span>
                        </div>
                      )
                    })}

                    {/* Selection Preview */}
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
      </Card>

      {/* ... (Reste du JSX du modal inchangé) */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-lg">Nouvelle réservation</DialogTitle>
          </DialogHeader>

          {dragState && (
            <div className="space-y-5 py-2">
              <div className="bg-accent/50 space-y-2 rounded-xl p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Propriété</span>
                  <span className="font-medium">
                    {properties.find((p) => p.id === dragState.propertyId)?.name}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Dates</span>
                  <span className="font-medium">
                    {Math.min(dragState.startDay, dragState.endDay)} -{' '}
                    {Math.max(dragState.startDay, dragState.endDay)} {MONTHS[month]} {year}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Durée</span>
                  <span className="font-medium">
                    {Math.abs(dragState.endDay - dragState.startDay) + 1} nuit(s)
                  </span>
                </div>
              </div>

              {/* Client Selection */}
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
                        setNewBooking({
                          ...newBooking,
                          clientId: null,
                          clientName: '',
                          isNewClient: false,
                        })
                      }
                    }}
                    onFocus={() => setShowClientDropdown(true)}
                    className="pl-9"
                  />

                  {/* Client Dropdown */}
                  {showClientDropdown && (clientSearch || filteredClients.length > 0) && (
                    <div className="bg-card border-border absolute top-full right-0 left-0 z-50 mt-1 max-h-64 overflow-auto rounded-xl border shadow-lg">
                      {filteredClients.map((client) => (
                        <button
                          key={client.id}
                          type="button"
                          className="hover:bg-accent/50 flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors"
                          onClick={() => handleSelectClient(client)}
                        >
                          <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium">
                            {client.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{client.name}</p>
                            <p className="text-muted-foreground truncate text-xs">{client.email}</p>
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
                              <p className="text-sm font-medium">
                                Créer &quot;{clientSearch}&quot;
                              </p>
                              <p className="text-muted-foreground text-xs">Nouveau client</p>
                            </div>
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Selected Client Badge */}
                {newBooking.clientId && !newBooking.isNewClient && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm">
                      <Check className="h-3.5 w-3.5" />
                      {newBooking.clientName}
                    </span>
                  </div>
                )}

                {/* New Client Form */}
                {newBooking.isNewClient && (
                  <div className="border-border bg-muted/30 mt-3 space-y-3 rounded-xl border p-4">
                    <div className="text-primary flex items-center gap-2 text-sm font-medium">
                      <UserPlus className="h-4 w-4" />
                      Nouveau client: {newBooking.clientName}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Email</Label>
                        <Input
                          type="email"
                          placeholder="email@exemple.com"
                          value={newBooking.clientEmail}
                          onChange={(e) =>
                            setNewBooking({ ...newBooking, clientEmail: e.target.value })
                          }
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Téléphone</Label>
                        <Input
                          placeholder="06 12 34 56 78"
                          value={newBooking.clientPhone}
                          onChange={(e) =>
                            setNewBooking({ ...newBooking, clientPhone: e.target.value })
                          }
                          className="h-9"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label>Statut</Label>
                <Select
                  value={newBooking.status}
                  onValueChange={(value: 'confirmed' | 'pending' | 'blocked') =>
                    setNewBooking({ ...newBooking, status: value })
                  }
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="confirmed">Confirmé</SelectItem>
                    <SelectItem value="blocked">Bloqué</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleCancelModal}
              className="rounded-xl bg-transparent"
            >
              Annuler
            </Button>
            <Button
              onClick={handleConfirmBooking}
              disabled={!newBooking.clientName.trim()}
              className="rounded-xl"
            >
              Créer la réservation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
