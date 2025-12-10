import useSWR from 'swr'
import type { Client } from '@/features/clients/types'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface ClientsResponse {
  clients: Client[]
  total: number
  totalPages: number
  page: number
  perPage: number
}

export function useClients(q?: string, page = 1, perPage = 10) {
  const params = new URLSearchParams({
    page: page.toString(),
    perPage: perPage.toString(),
  })
  if (q) params.set('q', q)

  const { data, error, mutate } = useSWR<ClientsResponse>(
    `/api/clients?${params.toString()}`,
    fetcher,
  )

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

export async function createClient(clientData: {
  firstName: string
  lastName: string
  email: string
  phone?: string
}) {
  const response = await fetch('/api/clients', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(clientData),
  })

  if (!response.ok) {
    throw new Error('Failed to create client')
  }

  return response.json()
}

export async function updateClient(
  id: string,
  clientData: Partial<{
    firstName: string
    lastName: string
    email: string
    phone: string
  }>,
) {
  const response = await fetch(`/api/clients/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(clientData),
  })

  if (!response.ok) {
    throw new Error('Failed to update client')
  }

  return response.json()
}

export async function deleteClient(id: string) {
  const response = await fetch(`/api/clients/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error('Failed to delete client')
  }

  return response.json()
}
