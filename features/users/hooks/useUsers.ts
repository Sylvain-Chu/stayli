import useSWR from 'swr'
import type { User } from '@/features/users/types'

interface UsersResponse {
  users: User[]
  total: number
  totalPages: number
  page: number
  perPage: number
}

export function useUsers(q?: string, page = 1, perPage = 10) {
  const params = new URLSearchParams({
    page: page.toString(),
    perPage: perPage.toString(),
  })
  if (q) params.set('q', q)

  const { data, error, isLoading, mutate } = useSWR<UsersResponse>(`/api/users?${params.toString()}`)

  return {
    users: data?.users,
    total: data?.total,
    totalPages: data?.totalPages,
    isLoading,
    isError: !!error,
    error: error as Error | undefined,
    mutate,
  }
}
