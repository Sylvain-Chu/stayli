/**
 * Shared types used across the application
 * These types match the Prisma schema but are used on the client side
 */

// ============ Enums ============

export type Role = 'ADMIN' | 'USER'
export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'blocked'
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
export type DiscountType = 'amount' | 'percent'

// ============ Base Entity Types ============

export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
}

// ============ User ============

export interface User extends BaseEntity {
  name: string | null
  email: string
  role: Role
}

export interface SessionUser {
  id: string
  email: string
  name?: string | null
  role: Role
}

// ============ Property ============

export interface Property extends BaseEntity {
  name: string
  address: string | null
  description: string | null
  contractDescription: string | null
}

export interface PropertyWithStats extends Property {
  revenue?: number
  _count?: {
    bookings: number
  }
}

// ============ Client ============

export interface Client extends BaseEntity {
  firstName: string
  lastName: string
  email: string
  phone: string | null
  address: string | null
  zipCode: string | null
  city: string | null
}

export interface ClientWithBookings extends Client {
  bookings?: Booking[]
}

// ============ Booking ============

export interface Booking extends BaseEntity {
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
  discountType: DiscountType | null
  hasLinens: boolean
  linensPrice: number
  hasCleaning: boolean
  cleaningPrice: number
  hasCancellationInsurance: boolean
  insuranceFee: number
  status: BookingStatus
  propertyId: string
  clientId: string
}

export interface BookingWithRelations extends Booking {
  property?: Property
  client?: Client
  invoice?: Invoice | null
}

// ============ Invoice ============

export interface Invoice extends BaseEntity {
  invoiceNumber: string
  issueDate: string
  dueDate: string
  amount: number
  status: InvoiceStatus
  bookingId: string
}

export interface InvoiceWithBooking extends Invoice {
  booking?: BookingWithRelations
}

// ============ Settings ============

export interface Settings extends BaseEntity {
  companyName: string
  companyAddress: string | null
  companyPhoneNumber: string | null
  companyEmail: string | null
  companySiret: string | null
  companyLogoUrl: string | null
  companyZipCode: string | null
  companyCity: string | null
  defaultLanguage: string
  currencyCode: string
  currencySymbol: string
  lowSeasonMonths: number[]
  lowSeasonRate: number
  highSeasonRate: number
  linensOptionPrice: number
  cleaningOptionPrice: number
  touristTaxRatePerPersonPerDay: number
  invoicePrefix: string
  invoiceDueDays: number
  invoicePaymentInstructions: string | null
  cancellationInsurancePercentage: number
  cancellationInsuranceProviderName: string
  depositPercentage: number
  securityDepositAmount: number
  checkInTime: string
  checkOutTime: string
}

// ============ API Response Types ============

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

export interface ApiSuccessResponse<T> {
  success: true
  data: T
}

export interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
  }
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

// ============ Stats Types ============

export interface BookingStats {
  total: number
  confirmed: number
  pending: number
  cancelled: number
  totalRevenue: number
  averagePrice: number
}

export interface ClientStats {
  total: number
  newThisMonth: number
  growthPercentage: number
  activeThisMonth: number
}

export interface PropertyStats {
  total: number
  withBookings: number
  availableThisMonth: number
  occupancyRate: number
}

export interface InvoiceStats {
  total: number
  paid: number
  overdue: number
  totalAmount: number
  paidAmount: number
  overdueAmount: number
}

export interface DashboardStats {
  bookings: {
    total: number
    thisMonth: number
    trend: number
  }
  revenue: {
    total: number
    thisMonth: number
    trend: number
  }
  clients: {
    total: number
    thisMonth: number
    trend: number
  }
  occupancy: {
    rate: number
    trend: number
  }
}
