import useSWR from 'swr'
import type { ExpenseStats } from '../types'

export function useExpenseStats(propertyId?: string) {
  const url = propertyId ? `/api/expenses/stats?propertyId=${propertyId}` : '/api/expenses/stats'

  const { data, error, mutate, isLoading } = useSWR<ExpenseStats>(url, {
    revalidateOnReconnect: false,
  })

  return {
    stats: data,
    isLoading,
    isError: !!error,
    error: error as Error | undefined,
    mutate,
  }
}
