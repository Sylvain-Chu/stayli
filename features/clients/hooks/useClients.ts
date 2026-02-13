import useSWR from 'swr'
import type { Client } from '@/features/clients/types'

interface ClientsResponse {
  clients: Client[]
  total: number
  totalPages: number
  page: number
  perPage: number
}

export function useClients(
  q?: string,
  page = 1,
  perPage = 10,
  sortBy?: string | null,
  sortDir?: string | null,
) {
  const params = new URLSearchParams({
    page: page.toString(),
    perPage: perPage.toString(),
  })
  if (q) params.set('q', q)
  if (sortBy && sortDir) {
    params.set('sortBy', sortBy)
    params.set('sortDir', sortDir)
  }

  const { data, error, mutate } = useSWR<ClientsResponse>(`/api/clients?${params.toString()}`)

  return {
    clients: data?.clients,
    total: data?.total,
    totalPages: data?.totalPages,
    isLoading: !error && !data,
    isError: error,
    error: error?.message,
    mutate,
  }
}
