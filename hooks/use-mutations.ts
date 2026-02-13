'use client'

/**
 * useMutations — Generic mutation hook factory
 *
 * Wraps service calls with:
 * - Loading state (isMutating)
 * - Error state + clearError
 * - Automatic SWR cache invalidation by key prefix
 */

import { useCallback, useState } from 'react'
import { useSWRConfig } from 'swr'

export interface UseMutationsReturn {
  /** Wrap any async call with loading / error / cache-invalidation */
  mutateAsync: <T>(fn: () => Promise<T>) => Promise<T>
  /** True while a mutation is in-flight */
  isMutating: boolean
  /** Last mutation error (null after clearError or new mutation) */
  error: Error | null
  /** Reset the error state */
  clearError: () => void
}

/**
 * @param cachePrefix  Key prefix used to invalidate related SWR cache entries
 *                     (e.g. '/api/properties' will revalidate every key starting with that string)
 */
export function useMutations(cachePrefix: string): UseMutationsReturn {
  const { mutate: globalMutate } = useSWRConfig()
  const [isMutating, setIsMutating] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const invalidateCache = useCallback(() => {
    globalMutate((key) => typeof key === 'string' && key.startsWith(cachePrefix), undefined, {
      revalidate: true,
    })
  }, [globalMutate, cachePrefix])

  const mutateAsync = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T> => {
      setIsMutating(true)
      setError(null)
      try {
        const result = await fn()
        invalidateCache()
        return result
      } catch (e) {
        const err = e instanceof Error ? e : new Error('An error occurred')
        setError(err)
        throw err
      } finally {
        setIsMutating(false)
      }
    },
    [invalidateCache],
  )

  const clearError = useCallback(() => setError(null), [])

  return { mutateAsync, isMutating, error, clearError }
}
