/**
 * Settings Service
 * Service layer for settings operations
 */

import { apiGet, apiPatch } from '@/lib/api-client'

// ============ Types ============

export type UpdateSettingsData = Record<string, unknown>

// ============ Service Functions ============

export async function getSettings<T = unknown>(): Promise<T> {
  return apiGet<T>('/api/settings')
}

export async function updateSettings<T = unknown>(data: UpdateSettingsData): Promise<T> {
  return apiPatch<T, UpdateSettingsData>('/api/settings', data)
}
