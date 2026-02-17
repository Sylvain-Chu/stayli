'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useCalendarBookings,
  useProperties,
  useClients,
  createCalendarBooking,
  createClient,
} from '@/hooks/use-calendar'
import type { CalendarBooking } from '@/hooks/use-calendar'
import { useToast } from '@/hooks/use-toast'
import { useDragSelection } from './use-drag-selection'
import { useBookingForm } from './use-booking-form'
import { CalendarHeader } from './calendar-header'
import { CalendarGrid } from './calendar-grid'
import { NewBookingDialog } from './new-booking-dialog'
import { BookingDetailsDialog } from './booking-details-dialog'

export function FullCalendar() {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showModal, setShowModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<CalendarBooking | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const { toast } = useToast()

  // Date computations
  const displayMonth = currentDate.getMonth()
  const displayYear = currentDate.getFullYear()
  const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate()
  const today = new Date()
  const isCurrentMonth = today.getMonth() === displayMonth && today.getFullYear() === displayYear
  const todayDay = isCurrentMonth ? today.getDate() : null
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  // Data fetching
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() + 1
  const {
    bookings,
    isLoading: bookingsLoading,
    mutate: mutateBookings,
  } = useCalendarBookings(year, month)
  const { properties, isLoading: propertiesLoading } = useProperties()
  const { clients, isLoading: clientsLoading, mutate: mutateClients } = useClients()

  // Day helpers
  const isDayOccupied = useCallback(
    (propertyId: string, day: number) => {
      return bookings.some(
        (b) => b.propertyId === propertyId && day >= b.startDay && day <= b.endDay,
      )
    },
    [bookings],
  )

  const isWeekend = (day: number) => {
    const dow = new Date(displayYear, displayMonth, day).getDay()
    return dow === 0 || dow === 6
  }

  // Custom hooks
  const drag = useDragSelection(isDayOccupied)
  const bookingForm = useBookingForm({ clients })

  // Navigation
  const prevMonth = () => setCurrentDate(new Date(displayYear, displayMonth - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(displayYear, displayMonth + 1, 1))

  // Wrap drag mouseUp to trigger modal + price calc
  const handleMouseUp = async () => {
    const selection = drag.handleMouseUp()
    if (selection) {
      // Check availability before opening the dialog
      try {
        const startDate = new Date(displayYear, displayMonth, selection.startDay)
        const endDate = new Date(
          displayYear,
          displayMonth,
          selection.startDay === selection.endDay ? selection.endDay + 1 : selection.endDay,
        )
        const res = await fetch('/api/bookings/check-availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            propertyId: selection.propertyId,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          }),
        })
        const { data } = await res.json()
        if (!data?.available) {
          toast({
            title: 'Dates non disponibles',
            description: `Ce logement est déjà réservé sur ces dates.`,
            variant: 'destructive',
          })
          drag.resetDrag()
          return
        }
      } catch {
        // If check fails, still allow opening the dialog — server will validate on save
      }

      setShowModal(true)
      const startDate = new Date(displayYear, displayMonth, selection.startDay)
      const endDate = new Date(displayYear, displayMonth, selection.endDay)
      bookingForm.calculatePrices(startDate, endDate)
    }
  }

  // Wrap option change to provide dates for debounced price recalc
  const handleOptionChange = (key: string, value: unknown) => {
    const ds = drag.dragState
    const dates = ds
      ? {
          startDate: new Date(displayYear, displayMonth, Math.min(ds.startDay, ds.endDay)),
          endDate: new Date(displayYear, displayMonth, Math.max(ds.startDay, ds.endDay)),
        }
      : null
    bookingForm.handleOptionChange(key, value, dates)
  }

  // Booking creation
  const handleConfirmBooking = async () => {
    if (!drag.dragState || !bookingForm.newBooking.clientName.trim()) return
    bookingForm.setIsSubmitting(true)

    try {
      const start = Math.min(drag.dragState.startDay, drag.dragState.endDay)
      const end = Math.max(drag.dragState.startDay, drag.dragState.endDay)
      const nb = bookingForm.newBooking

      let clientId = nb.clientId

      if (nb.isNewClient && nb.clientName.trim()) {
        const [firstName, ...lastNameParts] = nb.clientName.trim().split(' ')
        const lastName = lastNameParts.join(' ') || firstName
        const newClient = await createClient({
          firstName,
          lastName,
          email: nb.clientEmail || '',
          phone: nb.clientPhone || undefined,
        })
        clientId = newClient.id
        await mutateClients()
      }

      if (!clientId) {
        toast({
          title: 'Erreur',
          description: 'Veuillez sélectionner ou créer un client',
          variant: 'destructive',
        })
        return
      }

      const startDate = new Date(displayYear, displayMonth, start)
      // Ensure endDate is always at least 1 day after startDate
      const endDate = new Date(displayYear, displayMonth, end === start ? end + 1 : end)
      const totalPrice =
        (nb.basePrice || 0) +
        (nb.cleaningFee || 0) +
        (nb.taxes || 0) +
        (nb.linensPrice || 0) +
        (nb.insuranceFee || 0) -
        (nb.discount || 0)

      await createCalendarBooking({
        propertyId: drag.dragState.propertyId,
        clientId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        status: nb.status,
        totalPrice,
        basePrice: nb.basePrice,
        cleaningFee: nb.cleaningFee,
        taxes: nb.taxes,
        adults: nb.adults,
        children: nb.children,
        specialRequests: nb.specialRequests,
        discount: nb.discount,
        discountType: nb.discountType || null,
        hasLinens: nb.hasLinens,
        linensPrice: nb.linensPrice,
        hasCleaning: nb.hasCleaning,
        cleaningPrice: nb.cleaningPrice,
        hasCancellationInsurance: nb.hasCancellationInsurance,
        insuranceFee: nb.insuranceFee,
      })

      await mutateBookings()
      toast({ title: 'Réservation créée', description: 'La réservation a été créée avec succès' })
      setShowModal(false)
      drag.resetDrag()
      bookingForm.resetForm()
    } catch (error) {
      console.error('Error creating booking:', error)
      const message = error instanceof Error ? error.message : 'Impossible de créer la réservation'
      const details = (error as any)?.details
      const detailText = Array.isArray(details)
        ? details.map((d: { path?: string; message?: string }) => d.message || d.path).join(', ')
        : ''
      toast({
        title: 'Erreur de création',
        description: detailText || message,
        variant: 'destructive',
      })
    } finally {
      bookingForm.setIsSubmitting(false)
    }
  }

  const handleCancelModal = () => {
    setShowModal(false)
    drag.resetDrag()
    bookingForm.resetForm()
  }

  const handleBookingClick = (booking: CalendarBooking) => {
    setSelectedBooking(booking)
    setShowDetailsModal(true)
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
      <CalendarHeader
        displayMonth={displayMonth}
        displayYear={displayYear}
        onPrevMonth={prevMonth}
        onNextMonth={nextMonth}
      />

      <CalendarGrid
        properties={properties}
        days={days}
        daysInMonth={daysInMonth}
        todayDay={todayDay}
        dragState={drag.dragState}
        bookings={bookings}
        isWeekend={isWeekend}
        isDayOccupied={isDayOccupied}
        showSelectionPreview={drag.showSelectionPreview}
        onMouseDown={drag.handleMouseDown}
        onMouseEnter={drag.handleMouseEnter}
        onMouseUp={handleMouseUp}
        onBookingClick={handleBookingClick}
      />

      <NewBookingDialog
        open={showModal}
        onOpenChange={setShowModal}
        dragState={drag.dragState}
        properties={properties}
        displayMonth={displayMonth}
        newBooking={bookingForm.newBooking}
        setNewBooking={bookingForm.setNewBooking}
        clientSearch={bookingForm.clientSearch}
        setClientSearch={bookingForm.setClientSearch}
        showClientDropdown={bookingForm.showClientDropdown}
        setShowClientDropdown={bookingForm.setShowClientDropdown}
        filteredClients={bookingForm.filteredClients}
        showCreateClientOption={bookingForm.showCreateClientOption}
        isSubmitting={bookingForm.isSubmitting}
        isCalculating={bookingForm.isCalculating}
        onSelectClient={bookingForm.handleSelectClient}
        onCreateNewClient={bookingForm.handleCreateNewClient}
        onOptionChange={handleOptionChange}
        onConfirm={handleConfirmBooking}
        onCancel={handleCancelModal}
      />

      <BookingDetailsDialog
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
        booking={selectedBooking}
        onViewBooking={(id) => router.push(`/bookings/${id}`)}
      />
    </div>
  )
}
