import useSWR from 'swr'
import type { ClientStats } from '@/features/clients/types'

export function useClientStats() {
  const { data, error } = useSWR<ClientStats>('/api/clients/stats')

  return {
    stats: data,
    isLoading: !error && !data,
    error: error?.message,
  }
}
