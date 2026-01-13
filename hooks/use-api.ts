'use client'

import useSWR, { type SWRConfiguration } from 'swr'
import { useCallback, useState } from 'react'

/**
 * Generic fetcher for SWR
 * Automatically handles HTTP errors
 */
export async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url)

  if (!res.ok) {
    const error = new Error('An error occurred while loading data')
    throw error
  }

  return res.json()
}

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
    fetcher<T>,
    {
      revalidateOnFocus: false,
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
 * Multi-selection state
 */
export interface UseSelectionOptions<T> {
  /** Key used to identify items */
  idKey?: keyof T
}

/**
 * Hook to manage multi-item selection
 *
 * SOLID Principle: Single Responsibility
 * This hook exclusively handles selection logic
 *
 * @example
 * const { selectedIds, toggleSelection, selectAll, clearSelection } = useSelection<Booking>()
 */
export function useSelection<T extends { id: string }>(options: UseSelectionOptions<T> = {}) {
  const { idKey = 'id' } = options
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }, [])

  const selectAll = useCallback((ids: string[]) => {
    setSelectedIds(ids)
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedIds([])
  }, [])

  const isSelected = useCallback((id: string) => selectedIds.includes(id), [selectedIds])

  const toggleAll = useCallback(
    (items: T[]) => {
      const allIds = items.map((item) => String(item[idKey]))
      if (selectedIds.length === items.length) {
        clearSelection()
      } else {
        selectAll(allIds)
      }
    },
    [selectedIds.length, idKey, clearSelection, selectAll],
  )

  return {
    selectedIds,
    selectedCount: selectedIds.length,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
    toggleAll,
    hasSelection: selectedIds.length > 0,
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
