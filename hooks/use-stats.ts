import useSWR, { type SWRConfiguration } from 'swr'

export interface UseStatsReturn<T> {
  stats: T | undefined
  isLoading: boolean
  error: Error | undefined
  refresh: () => Promise<T | undefined>
}

/**
 * Generic stats hook factory.
 *
 * Returns a consistent `{ stats, isLoading, error, refresh }` shape
 * regardless of the entity type.
 */
export function useStats<T>(endpoint: string, options?: SWRConfiguration): UseStatsReturn<T> {
  const { data, error, isLoading, mutate } = useSWR<T>(endpoint, options)

  return {
    stats: data,
    isLoading,
    error: error as Error | undefined,
    refresh: () => mutate(),
  }
}
