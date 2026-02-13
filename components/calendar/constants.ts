import type { NewBookingState } from './types'

export const MONTHS = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
]

export const statusColors = {
  confirmed: 'bg-[#2d5a47] hover:bg-[#234a3a]',
  pending: 'bg-[#d4a853] hover:bg-[#c49943]',
  cancelled: 'bg-[#c53030] hover:bg-[#a52828]',
  blocked: 'bg-[#9ca3af] hover:bg-[#8b929b]',
} as const

export const DEFAULT_NEW_BOOKING: NewBookingState = {
  clientId: null,
  clientName: '',
  clientEmail: '',
  clientPhone: '',
  status: 'pending',
  isNewClient: false,
  adults: 2,
  children: 0,
  basePrice: 0,
  cleaningFee: 0,
  taxes: 0,
  discount: 0,
  discountType: '',
  hasLinens: false,
  linensPrice: 0,
  hasCleaning: false,
  cleaningPrice: 0,
  hasCancellationInsurance: false,
  insuranceFee: 0,
  specialRequests: '',
}
