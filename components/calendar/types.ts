export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'blocked'

export interface DragState {
  propertyId: string
  startDay: number
  endDay: number
}

export interface NewBookingState {
  clientId: string | null
  clientName: string
  clientEmail: string
  clientPhone: string
  status: BookingStatus
  isNewClient: boolean
  adults: number
  children: number
  basePrice: number
  cleaningFee: number
  taxes: number
  discount: number
  discountType: string
  hasLinens: boolean
  linensPrice: number
  hasCleaning: boolean
  cleaningPrice: number
  hasCancellationInsurance: boolean
  insuranceFee: number
  specialRequests: string
}
