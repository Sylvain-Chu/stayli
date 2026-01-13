/**
 * Properties Service
 * Service layer for property operations
 */

import { apiGet, apiPost, apiPatch, apiDelete, buildUrl } from '@/lib/api-client'
import type { Property, PropertyWithStats, PropertyStats } from '@/types/entities'

// ============ Types ============

export interface PropertiesListParams {
  page?: number
  perPage?: number
  search?: string
}

export interface PropertiesListResponse {
  properties: PropertyWithStats[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

export interface CreatePropertyData {
  name: string
  address?: string
  description?: string
  contractDescription?: string
}

export type UpdatePropertyData = Partial<CreatePropertyData>

// ============ Service Functions ============

/**
 * Fetches the list of properties with filters and pagination
 */
export async function getProperties(
  params: PropertiesListParams = {},
): Promise<PropertiesListResponse> {
  const url = buildUrl('/api/properties', {
    page: params.page,
    perPage: params.perPage,
    search: params.search,
  })

  return apiGet<PropertiesListResponse>(url)
}

/**
 * Fetches all properties
 */
export async function getPropertiesList(): Promise<Property[]> {
  return apiGet<Property[]>('/api/properties/list')
}

/**
 * Fetches a property by its ID
 */
export async function getProperty(id: string): Promise<PropertyWithStats> {
  return apiGet<PropertyWithStats>(`/api/properties/${id}`)
}

/**
 * Creates a new property
 */
export async function createProperty(data: CreatePropertyData): Promise<Property> {
  return apiPost<Property, CreatePropertyData>('/api/properties', data)
}

/**
 * Updates a property
 */
export async function updateProperty(id: string, data: UpdatePropertyData): Promise<Property> {
  return apiPatch<Property, UpdatePropertyData>(`/api/properties/${id}`, data)
}

/**
 * Deletes a property
 */
export async function deleteProperty(id: string): Promise<void> {
  return apiDelete(`/api/properties/${id}`)
}

/**
 * Fetches property statistics
 */
export async function getPropertyStats(): Promise<PropertyStats> {
  return apiGet<PropertyStats>('/api/properties/stats')
}
