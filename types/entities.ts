/**
 * Entity Types
 * Business entity types for the application
 */

// ============ Enums ============

export type Role = 'ADMIN' | 'USER'
export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'blocked'
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
export type DiscountType = 'amount' | 'percent'

// ============ Status Configuration ============

export interface StatusConfig {
  label: string
  color: string
  bgColor: string
}

export const BOOKING_STATUS_CONFIG: Record<BookingStatus, StatusConfig> = {
  confirmed: { label: 'Confirmed', color: 'text-green-700', bgColor: 'bg-green-100' },
  pending: { label: 'Pending', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  cancelled: { label: 'Cancelled', color: 'text-red-700', bgColor: 'bg-red-100' },
  blocked: { label: 'Blocked', color: 'text-gray-700', bgColor: 'bg-gray-100' },
} as const

export const INVOICE_STATUS_CONFIG: Record<InvoiceStatus, StatusConfig> = {
  draft: { label: 'Draft', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  sent: { label: 'Sent', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  paid: { label: 'Paid', color: 'text-green-700', bgColor: 'bg-green-100' },
  overdue: { label: 'Overdue', color: 'text-red-700', bgColor: 'bg-red-100' },
  cancelled: { label: 'Cancelled', color: 'text-gray-700', bgColor: 'bg-gray-100' },
} as const

// ============ Base Entity ============

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

/**
 * Generate the initials of a client
 */
export function getClientInitials(client: Pick<Client, 'firstName' | 'lastName'>): string {
  return `${client.firstName.charAt(0)}${client.lastName.charAt(0)}`.toUpperCase()
}

/**
 * Generate the full name of a client
 */
export function getClientFullName(client: Pick<Client, 'firstName' | 'lastName'>): string {
  return `${client.firstName} ${client.lastName}`
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
}

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
  occupancyRate: number
  occupancyTrend: number
  monthlyRevenue: number
  revenueTrend: number
  activeBookings: number
  bookingsTrend: number
  pendingInvoices: number
}
