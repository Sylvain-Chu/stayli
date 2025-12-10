// Types pour la feature Bookings
export interface Booking {
  id: string
  startDate: string
  endDate: string
  totalPrice: number
  basePrice: number
  cleaningFee: number
  taxes: number
  adults: number
  children: number
  specialRequests: string | null
  discount: number
  discountType: string | null
  hasLinens: boolean
  linensPrice: number
  hasCleaning: boolean
  cleaningPrice: number
  hasCancellationInsurance: boolean
  insuranceFee: number
  status: BookingStatus
  propertyId: string
  clientId: string
  property?: {
    id: string
    name: string
    address: string | null
    description: string | null
  }
  client?: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string | null
  }
  invoice?: {
    id: string
    invoiceNumber: string
    status: string
  } | null
  createdAt: string
  updatedAt: string
}

export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'blocked'

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
  status: BookingStatus
}

export interface BookingStats {
  total: number
  confirmed: number
  pending: number
  cancelled: number
  totalRevenue: number
  averagePrice: number
}
