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

const fetcher = async (url: string): Promise<BookingStats> => {
  const response = await fetch(url)

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || 'Erreur lors de la récupération des statistiques')
  }

  return response.json()
}

export function useBookingStats(): UseBookingStatsReturn {
  const { data, error, mutate, isValidating } = useSWR<BookingStats>(
    '/api/bookings/stats',
    fetcher,
    {
      revalidateOnFocus: false,
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
