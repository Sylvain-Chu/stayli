/**
 * Clients Feature Types
 * Re-exports centralized types for backwards compatibility
 */

export type { Client, ClientStats } from '@/types/entities'

// Form data type for creating/editing clients
export type ClientFormData = {
  firstName: string
  lastName: string
  email: string
  phone?: string | null
  address?: string | null
  zipCode?: string | null
  city?: string | null
}
