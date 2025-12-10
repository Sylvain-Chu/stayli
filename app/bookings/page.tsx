'use client'

import { Suspense, lazy, useState, useEffect } from 'react'
import { AppLayout } from '@/components/layouts/app-shell'
import { BookingsToolbar, BookingsStats } from '@/features/bookings'
import { BookingsProvider } from '@/features/bookings/context/BookingsContext'
import { Skeleton } from '@/components/ui/skeleton'
import { useDebounce } from '@/hooks/use-debounce'
import { useBookings } from '@/features/bookings/hooks/useBookings'
import { BookingStatus } from '@/features/bookings/types'

const BookingsTable = lazy(() =>
  import('@/features/bookings').then((mod) => ({ default: mod.BookingsTable })),
)

function BookingsContent() {
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [status, setStatus] = useState<BookingStatus | 'all'>('all')
  const [page, setPage] = useState(1)

  const debouncedSearch = useDebounce(searchQuery, 300)

  const filters = {
    from: dateFrom || undefined,
    to: dateTo || undefined,
    q: debouncedSearch || undefined,
    status: status !== 'all' ? status : undefined,
  }

  const { bookings, isLoading, isError, mutate } = useBookings(filters, page, 10)

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, dateFrom, dateTo, status])

  return (
    <>
      <BookingsStats />
      <BookingsToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        dateFrom={dateFrom}
        onDateFromChange={setDateFrom}
        dateTo={dateTo}
        onDateToChange={setDateTo}
        status={status}
        onStatusChange={setStatus}
        onDataChange={mutate}
      />
      <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
        <BookingsTable
          bookings={bookings || []}
          isLoading={isLoading}
          isError={isError}
          onDataChange={mutate}
        />
      </Suspense>
    </>
  )
}

export default function BookingsPage() {
  return (
    <AppLayout title="Réservations">
      <BookingsProvider>
        <div className="space-y-4">
          <BookingsContent />
        </div>
      </BookingsProvider>
    </AppLayout>
  )
}
