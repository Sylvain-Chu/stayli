import useSWR from 'swr'
import { PropertyStats } from '../types'

export function usePropertyStats() {
  const { data, error, isLoading, mutate } = useSWR<PropertyStats>(
    '/api/properties/stats',
    {
      revalidateOnReconnect: false,
    },
  )

  return {
    stats: data,
    isLoading,
    isError: error,
    mutate,
  }
}
