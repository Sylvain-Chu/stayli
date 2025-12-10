import useSWR from 'swr'
import { PropertyStats } from '../types'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function usePropertyStats() {
  const { data, error, isLoading, mutate } = useSWR<PropertyStats>(
    '/api/properties/stats',
    fetcher,
    {
      revalidateOnFocus: false,
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
