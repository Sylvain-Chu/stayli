import useSWR from 'swr'
import type { Settings } from '@/types/entities'

export function useSettings() {
  const { data, error, isLoading, mutate } = useSWR<Settings>('/api/settings')

  return {
    settings: data,
    isLoading,
    isError: !!error,
    error: error as Error | undefined,
    mutate,
  }
}
