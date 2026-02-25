/**
 * Booking Status Color Map
 * Used across components for consistent color theming
 */

export const BOOKING_STATUS_COLORS = {
  pending: { label: 'En attente', color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  confirmed: { label: 'Confirmée', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  cancelled: { label: 'Annulée', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
  blocked: { label: 'Bloquée', color: 'bg-gray-100 text-gray-700', dot: 'bg-gray-500' },
} as const

export const getBookingStatusColor = (status: string): string => {
  return (BOOKING_STATUS_COLORS[status as keyof typeof BOOKING_STATUS_COLORS]?.color) || 'bg-gray-100 text-gray-700'
}

export const getBookingStatusDot = (status: string): string => {
  return (BOOKING_STATUS_COLORS[status as keyof typeof BOOKING_STATUS_COLORS]?.dot) || 'bg-gray-500'
}

export const getBookingStatusLabel = (status: string): string => {
  return (BOOKING_STATUS_COLORS[status as keyof typeof BOOKING_STATUS_COLORS]?.label) || status
}
