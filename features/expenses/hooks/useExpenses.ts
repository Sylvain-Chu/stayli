import useSWR from 'swr'
import type { Expense } from '../types'

export function useExpenses(
  searchQuery = '',
  page = 1,
  perPage = 10,
  propertyId?: string,
  category?: string,
) {
  const params = new URLSearchParams({
    page: page.toString(),
    perPage: perPage.toString(),
  })
  if (searchQuery) params.set('search', searchQuery)
  if (propertyId) params.set('propertyId', propertyId)
  if (category) params.set('category', category)

  const { data, error, mutate, isLoading } = useSWR<{
    expenses: Expense[]
    total: number
    totalPages: number
  }>(`/api/expenses?${params.toString()}`, {
    revalidateOnReconnect: false,
  })

  return {
    expenses: data?.expenses as Expense[] | undefined,
    total: data?.total as number | undefined,
    totalPages: data?.totalPages as number | undefined,
    isLoading,
    isError: !!error,
    error: error as Error | undefined,
    mutate,
  }
}

export function useExpense(id: string) {
  const { data, error, isLoading, mutate } = useSWR(id ? `/api/expenses/${id}` : null)

  return {
    expense: data as Expense | undefined,
    isLoading,
    isError: !!error,
    error: error as Error | undefined,
    mutate,
  }
}
