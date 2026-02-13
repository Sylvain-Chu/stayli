import useSWR from 'swr'
import type { Property } from '@/features/properties/types'

interface PropertiesResponse {
  properties: Property[]
  total: number
  totalPages: number
  page: number
  perPage: number
}

export function useProperties(q?: string, page = 1, perPage = 10) {
  const params = new URLSearchParams({
    page: page.toString(),
    perPage: perPage.toString(),
  })
  if (q) params.set('q', q)

  const { data, error, mutate } = useSWR<PropertiesResponse>(
    `/api/properties?${params.toString()}`,
  )

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

export async function createProperty(propertyData: {
  name: string
  address?: string
  description?: string
}) {
  const response = await fetch('/api/properties', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(propertyData),
  })

  if (!response.ok) {
    throw new Error('Failed to create property')
  }

  return response.json()
}

export async function updateProperty(
  id: string,
  propertyData: Partial<{
    name: string
    address: string
    description: string
  }>,
) {
  const response = await fetch(`/api/properties/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(propertyData),
  })

  if (!response.ok) {
    throw new Error('Failed to update property')
  }

  return response.json()
}

export async function deleteProperty(id: string) {
  const response = await fetch(`/api/properties/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error('Failed to delete property')
  }

  return response.json()
}
