import useSWR from 'swr'
import type { ClientStats } from '@/features/clients/types'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useClientStats() {
  const { data, error } = useSWR<ClientStats>('/api/clients/stats', fetcher)

  return {
    stats: data,
    isLoading: !error && !data,
    error: error?.message,
  }
}
