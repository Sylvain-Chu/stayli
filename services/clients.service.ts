/**
 * Clients Service
 * Service layer for client operations
 */

import { apiGet, apiPost, apiPatch, apiDelete, buildUrl } from '@/lib/api-client'
import type { Client, ClientStats } from '@/types/entities'

// ============ Types ============

export interface ClientsListParams {
  page?: number
  perPage?: number
  q?: string
  includeStats?: boolean
}

export interface ClientsListResponse {
  clients: Client[]
  total: number
  page: number
  perPage: number
  totalPages: number
  stats?: ClientStats
}

export interface CreateClientData {
  firstName: string
  lastName: string
  email: string
  phone?: string
  address?: string
  zipCode?: string
  city?: string
}

export type UpdateClientData = Partial<CreateClientData>

// ============ Service Functions ============

/**
 * Fetches the list of clients with filters and pagination
 */
export async function getClients(params: ClientsListParams = {}): Promise<ClientsListResponse> {
  const url = buildUrl('/api/clients', {
    page: params.page,
    perPage: params.perPage,
    q: params.q,
    includeStats: params.includeStats,
  })

  return apiGet<ClientsListResponse>(url)
}

/**
 * Fetches all clients (useful for select inputs)
 */
export async function getClientsList(): Promise<Client[]> {
  return apiGet<Client[]>('/api/clients/list')
}

/**
 * Fetches a client by its ID
 */
export async function getClient(id: string): Promise<Client> {
  return apiGet<Client>(`/api/clients/${id}`)
}

/**
 * Creates a new client
 */
export async function createClient(data: CreateClientData): Promise<Client> {
  return apiPost<Client, CreateClientData>('/api/clients', data)
}

/**
 * Updates a client
 */
export async function updateClient(id: string, data: UpdateClientData): Promise<Client> {
  return apiPatch<Client, UpdateClientData>(`/api/clients/${id}`, data)
}

/**
 * Deletes a client
 */
export async function deleteClient(id: string): Promise<void> {
  return apiDelete(`/api/clients/${id}`)
}

/**
 * Deletes multiple clients
 */
export async function deleteClients(ids: string[]): Promise<void> {
  await Promise.all(ids.map((id) => deleteClient(id)))
}

/**
 * Fetches client statistics
 */
export async function getClientStats(): Promise<ClientStats> {
  return apiGet<ClientStats>('/api/clients/stats')
}
