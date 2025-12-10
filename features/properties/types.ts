export interface Property {
  id: string
  name: string
  address?: string | null
  description?: string | null
  createdAt: string
  updatedAt: string
  revenue?: number
  _count?: {
    bookings: number
  }
}

export type PropertyFormData = Pick<Property, 'name' | 'address' | 'description'>

export type PropertyStats = {
  total: number
  withBookings: number
  availableThisMonth: number
  occupancyRate: number
}
