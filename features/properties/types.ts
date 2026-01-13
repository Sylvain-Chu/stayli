/**
 * Properties Feature Types
 * Re-exports centralized types for backwards compatibility
 */

export type {
  PropertyWithStats as Property,
  PropertyWithStats,
  PropertyStats,
} from '@/types/entities'

// Form data type for creating/editing properties
export type PropertyFormData = {
  name: string
  address?: string | null
  description?: string | null
  contractDescription?: string | null
}
