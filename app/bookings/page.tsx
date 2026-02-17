'use client'

import { Suspense, lazy, useState } from 'react'
import { AppLayout } from '@/components/layouts/app-shell'
import { BookingsToolbar, BookingsStats } from '@/features/bookings'
import { BookingsProvider } from '@/features/bookings/context/BookingsContext'
import { Skeleton } from '@/components/ui/skeleton'
import { useDebounce } from '@/hooks/use-debounce'
import { useBookings, type BookingsFilters } from '@/features/bookings/hooks/useBookings'
import type { BookingStatus } from '@/types/entities'

const BookingsTable = lazy(() =>
  import('@/features/bookings').then((mod) => ({ default: mod.BookingsTable })),
)

function BookingsContent() {
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [status, setStatus] = useState<BookingStatus | 'all'>('all')
  const [page, setPage] = useState(1)
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null)

  const debouncedSearch = useDebounce(searchQuery, 300)

  const filters: BookingsFilters = {
    from: dateFrom || undefined,
    to: dateTo || undefined,
    q: debouncedSearch || undefined,
    status: status !== 'all' ? status : undefined,
  }

  const { bookings, total, isLoading, error, refresh } = useBookings({
    filters,
    page,
    perPage: 10,
    sortBy: sortColumn,
    sortDir: sortDirection,
  })

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setPage(1)
  }

  const handleDateFromChange = (value: string) => {
    setDateFrom(value)
    setPage(1)
  }

  const handleDateToChange = (value: string) => {
    setDateTo(value)
    setPage(1)
  }

  const handleStatusChange = (value: BookingStatus | 'all') => {
    setStatus(value)
    setPage(1)
  }

  return (
    <>
      <BookingsStats />
      <BookingsToolbar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        dateFrom={dateFrom}
        onDateFromChange={handleDateFromChange}
        dateTo={dateTo}
        onDateToChange={handleDateToChange}
        status={status}
        onStatusChange={handleStatusChange}
        onDataChange={refresh}
      />
      <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
        <BookingsTable
          bookings={bookings || []}
          isLoading={isLoading}
          isError={!!error}
          onDataChange={refresh}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSortChange={(col, dir) => {
            setSortColumn(col)
            setSortDirection(dir)
          }}
          page={page}
          perPage={10}
          total={total}
          onPageChange={setPage}
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
