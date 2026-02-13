/**
 * useBookingStats Hook
 * Fetches booking statistics from the API
 */

import useSWR from 'swr'
import type { BookingStats } from '@/types/entities'

export interface UseBookingStatsReturn {
  stats: BookingStats | undefined
  isLoading: boolean
  isValidating: boolean
  error: Error | undefined
  refresh: () => Promise<BookingStats | undefined>
}

export function useBookingStats(): UseBookingStatsReturn {
  const { data, error, mutate, isValidating } = useSWR<BookingStats>(
    '/api/bookings/stats',
    {
      dedupingInterval: 60000,
    },
  )

  return {
    stats: data,
    isLoading: !error && !data,
    isValidating,
    error: error as Error | undefined,
    refresh: () => mutate(),
  }
}
