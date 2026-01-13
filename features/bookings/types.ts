/**
 * Bookings Feature Types
 * Re-exports centralized types for backwards compatibility
 */

export type {
  BookingWithRelations as Booking,
  BookingWithRelations,
  BookingStatus,
  BookingStats,
  Property,
  Client,
} from '@/types/entities'

export interface BookingFormData {
  startDate: string
  endDate: string
  propertyId: string
  clientId: string
  adults: number
  children: number
  basePrice: number
  cleaningFee: number
  taxes: number
  discount: number
  discountType?: string | null
  hasLinens: boolean
  linensPrice: number
  hasCleaning: boolean
  cleaningPrice: number
  hasCancellationInsurance: boolean
  insuranceFee: number
  specialRequests?: string | null
  status: import('@/types/entities').BookingStatus
}
