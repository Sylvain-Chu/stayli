'use client'

import useSWR, { type SWRConfiguration } from 'swr'
import { useCallback, useState } from 'react'

export { swrFetcher as fetcher } from '@/lib/swr-fetcher'

/**
 * Options for useApiQuery
 */
export interface UseApiQueryOptions<T> extends SWRConfiguration<T> {
  /** Disables the request if false */
  enabled?: boolean
}

/**
 * Generic hook for GET API requests
 * Wraps SWR with a default configuration
 *
 * This hook can be extended without modification via options
 *
 * @example
 * const { data, isLoading, error } = useApiQuery<Booking[]>('/api/bookings')
 */
export function useApiQuery<T>(url: string | null, options: UseApiQueryOptions<T> = {}) {
  const { enabled = true, ...swrOptions } = options

  const { data, error, isLoading, isValidating, mutate } = useSWR<T>(
    enabled ? url : null,
    {
      ...swrOptions,
    },
  )

  return {
    data,
    error,
    isLoading,
    isValidating,
    isError: !!error,
    mutate,
  }
}

/**
 * Pagination state
 */
export interface PaginationState {
  page: number
  perPage: number
}

/**
 * Hook to manage pagination
 *
 * SOLID Principle: Single Responsibility
 * This hook exclusively handles pagination logic
 *
 * @example
 * const { page, perPage, setPage, nextPage, prevPage } = usePagination({ perPage: 10 })
 */
export function usePagination(initialState: Partial<PaginationState> = {}) {
  const [page, setPage] = useState(initialState.page ?? 1)
  const [perPage, setPerPage] = useState(initialState.perPage ?? 10)

  const nextPage = useCallback(() => {
    setPage((p) => p + 1)
  }, [])

  const prevPage = useCallback(() => {
    setPage((p) => Math.max(1, p - 1))
  }, [])

  const goToPage = useCallback((newPage: number) => {
    setPage(Math.max(1, newPage))
  }, [])

  const reset = useCallback(() => {
    setPage(1)
  }, [])

  return {
    page,
    perPage,
    setPage: goToPage,
    setPerPage,
    nextPage,
    prevPage,
    reset,
  }
}

/**
 * Type for sorting direction
 */
export type SortDirection = 'asc' | 'desc' | null

/**
 * Sorting state
 */
export interface SortState {
  column: string | null
  direction: SortDirection
}

/**
 * Hook to manage data sorting
 *
 * @example
 * const { sortColumn, sortDirection, handleSort } = useSort()
 */
export function useSort(initialState: SortState = { column: null, direction: null }) {
  const [sortState, setSortState] = useState<SortState>(initialState)

  const handleSort = useCallback((column: string) => {
    setSortState((prev) => {
      if (prev.column !== column) {
        return { column, direction: 'asc' }
      }
      if (prev.direction === 'asc') {
        return { column, direction: 'desc' }
      }
      return { column: null, direction: null }
    })
  }, [])

  const resetSort = useCallback(() => {
    setSortState({ column: null, direction: null })
  }, [])

  return {
    sortColumn: sortState.column,
    sortDirection: sortState.direction,
    handleSort,
    resetSort,
  }
}
