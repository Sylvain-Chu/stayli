'use client'

import { AppLayout } from '@/components/layouts/app-shell'
import { BookingForm } from '@/features/bookings'
import { BookingSummary } from '@/features/bookings'
import { BookingFormProvider } from '@/features/bookings/context/BookingFormContext'

export default function CreateBookingPage() {
  return (
    <AppLayout title="Nouvelle Réservation">
      <BookingFormProvider>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <BookingForm />
          </div>
          <div className="lg:col-span-1">
            <BookingSummary />
          </div>
        </div>
      </BookingFormProvider>
    </AppLayout>
  )
}
