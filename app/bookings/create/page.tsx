import { AppLayout } from '@/components/layouts/app-shell'
import { BookingForm } from '@/features/bookings/components/BookingForm'
import { BookingSummary } from '@/features/bookings/components/BookingSummary'
import { BookingFormProvider } from '@/features/bookings/context/BookingFormContext'

export default async function CreateBookingPage({
  searchParams,
}: {
  searchParams: Promise<{ propertyId?: string; startDate?: string; endDate?: string }>
}) {
  const { propertyId, startDate, endDate } = await searchParams

  return (
    <AppLayout title="Nouvelle Réservation">
      <BookingFormProvider initialValues={{ propertyId, startDate, endDate }}>
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
