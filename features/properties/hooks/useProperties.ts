import useSWR from 'swr'
import type { Property } from '@/features/properties/types'

interface PropertiesResponse {
  properties: Property[]
  total: number
  totalPages: number
  page: number
  perPage: number
}

export function useProperties(
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

  const { data, error, mutate } = useSWR<PropertiesResponse>(`/api/properties?${params.toString()}`)

  return {
    properties: data?.properties,
    total: data?.total,
    totalPages: data?.totalPages,
    isLoading: !error && !data,
    isError: error,
    error: error?.message,
    mutate,
  }
}
