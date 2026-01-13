/**
 * useBookings Hook
 * SWR hook for booking management with filters and pagination
 *
 * SOLID Principles:
 * - Single Responsibility: Exclusively handles booking fetching/mutation
 * - Interface Segregation: Returns only necessary data
 */

import useSWR from 'swr'
import { buildUrl } from '@/lib/api-client'
import type { BookingWithRelations, BookingStatus } from '@/types/entities'

// ============ Types ============

export interface BookingsFilters {
  /** Minimum start date */
  from?: string
  /** Maximum end date */
  to?: string
  /** Text search (client, property) */
  q?: string
  /** Filter by status */
  status?: BookingStatus
}

export interface BookingsResponse {
  bookings: BookingWithRelations[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

export interface UseBookingsOptions {
  /** Filters to apply */
  filters?: BookingsFilters
  /** Current page (default: 1) */
  page?: number
  /** Items per page (default: 10) */
  perPage?: number
  /** Revalidation interval in ms (default: 0 = disabled) */
  refreshInterval?: number
  /** Revalidate when the window gains focus */
  revalidateOnFocus?: boolean
}

export interface UseBookingsReturn {
  /** List of bookings */
  bookings: BookingWithRelations[] | undefined
  /** Total number of bookings */
  total: number | undefined
  /** Total number of pages */
  totalPages: number | undefined
  /** Current page */
  currentPage: number | undefined
  /** Indicates if loading is in progress */
  isLoading: boolean
  /** Indicates if a validation is in progress */
  isValidating: boolean
  /** Potential error */
  error: Error | undefined
  /** Function to reload data */
  refresh: () => Promise<BookingsResponse | undefined>
  /** Function to mutate data locally */
  mutate: (
    data?: BookingsResponse | Promise<BookingsResponse>,
    shouldRevalidate?: boolean,
  ) => Promise<BookingsResponse | undefined>
}

// ============ Fetcher ============

const fetcher = async (url: string): Promise<BookingsResponse> => {
  const response = await fetch(url)

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || 'Error while fetching bookings')
  }

  return response.json()
}

// ============ Hook ============

/**
 * Hook to fetch the list of bookings with filters and pagination
 *
 * @example
 * ```tsx
 * const { bookings, isLoading, totalPages } = useBookings({
 * filters: { status: 'confirmed', from: '2026-01-01' },
 * page: 1,
 * perPage: 20,
 * })
 * ```
 */
export function useBookings(options: UseBookingsOptions = {}): UseBookingsReturn {
  const {
    filters = {},
    page = 1,
    perPage = 10,
    refreshInterval = 0,
    revalidateOnFocus = true,
  } = options

  const url = buildUrl('/api/bookings', {
    page,
    perPage,
    from: filters.from,
    to: filters.to,
    q: filters.q,
    status: filters.status,
  })

  const { data, error, mutate, isValidating } = useSWR<BookingsResponse>(url, fetcher, {
    refreshInterval,
    revalidateOnFocus,
    keepPreviousData: true,
  })

  return {
    bookings: data?.bookings,
    total: data?.total,
    totalPages: data?.totalPages,
    currentPage: data?.page,
    isLoading: !error && !data,
    isValidating,
    error: error as Error | undefined,
    refresh: () => mutate(),
    mutate,
  }
}

// ============ Single Booking Hook ============

export interface UseBookingReturn {
  booking: BookingWithRelations | undefined
  isLoading: boolean
  isValidating: boolean
  error: Error | undefined
  refresh: () => Promise<BookingWithRelations | undefined>
  mutate: (
    data?: BookingWithRelations | Promise<BookingWithRelations>,
    shouldRevalidate?: boolean,
  ) => Promise<BookingWithRelations | undefined>
}

const singleBookingFetcher = async (url: string): Promise<BookingWithRelations> => {
  const response = await fetch(url)

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || 'Error while fetching the booking')
  }

  return response.json()
}

/**
 * Hook to fetch a single booking by ID
 */
export function useBooking(id: string | null | undefined): UseBookingReturn {
  const { data, error, mutate, isValidating } = useSWR<BookingWithRelations>(
    id ? `/api/bookings/${id}` : null,
    singleBookingFetcher,
  )

  return {
    booking: data,
    isLoading: !error && !data && !!id,
    isValidating,
    error: error as Error | undefined,
    refresh: () => mutate(),
    mutate,
  }
}
