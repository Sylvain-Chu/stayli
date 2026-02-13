import { useStats } from '@/hooks/use-stats'
import type { BookingStats } from '@/types/entities'

export type { UseStatsReturn as UseBookingStatsReturn } from '@/hooks/use-stats'

export function useBookingStats() {
  return useStats<BookingStats>('/api/bookings/stats', { dedupingInterval: 60000 })
}
