import useSWR from 'swr'
import { BookingStats } from '../types'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useBookingStats() {
  const { data, error, mutate } = useSWR<BookingStats>('/api/bookings/stats', fetcher)

  return {
    stats: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  }
}
