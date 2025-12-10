import useSWR from 'swr'
import { Booking, BookingStatus, BookingFormData } from '../types'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface BookingsResponse {
  bookings: Booking[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

export function useBookings(
  filters?: {
    from?: string
    to?: string
    q?: string
    status?: BookingStatus
  },
  page = 1,
  perPage = 10,
) {
  const params = new URLSearchParams({
    page: page.toString(),
    perPage: perPage.toString(),
  })

  if (filters?.from) params.set('from', filters.from)
  if (filters?.to) params.set('to', filters.to)
  if (filters?.q) params.set('q', filters.q)
  if (filters?.status) params.set('status', filters.status)

  const { data, error, mutate } = useSWR<BookingsResponse>(
    `/api/bookings?${params.toString()}`,
    fetcher,
  )

  return {
    bookings: data?.bookings,
    total: data?.total,
    totalPages: data?.totalPages,
    isLoading: !error && !data,
    isError: error,
    mutate,
  }
}

export function useBooking(id: string) {
  const { data, error, mutate } = useSWR<Booking>(id ? `/api/bookings/${id}` : null, fetcher)

  return {
    booking: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  }
}

export async function createBooking(bookingData: any) {
  const response = await fetch('/api/bookings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bookingData),
  })

  if (!response.ok) {
    throw new Error('Failed to create booking')
  }

  return response.json()
}

export async function updateBooking(id: string, bookingData: any) {
  const response = await fetch(`/api/bookings/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bookingData),
  })

  if (!response.ok) {
    throw new Error('Failed to update booking')
  }

  return response.json()
}

export async function deleteBooking(id: string) {
  const response = await fetch(`/api/bookings/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error('Failed to delete booking')
  }

  return response.json()
}

export async function calculatePrice(priceData: {
  startDate: string
  endDate: string
  adults: number
  children: number
  hasLinens: boolean
  hasCleaning: boolean
  hasCancellationInsurance: boolean
  discount?: number
  discountType?: 'amount' | 'percent'
}) {
  const response = await fetch('/api/bookings/calculate-price', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(priceData),
  })

  if (!response.ok) {
    throw new Error('Failed to calculate price')
  }

  return response.json()
}
