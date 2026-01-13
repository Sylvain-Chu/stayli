/**
 * Bookings Service
 * Service layer for booking operations
 *
 * SOLID Principle: Single Responsibility
 * This service exclusively handles operations related to bookings
 */

import { apiGet, apiPost, apiPatch, apiDelete, buildUrl } from '@/lib/api-client'
import type { Booking, BookingWithRelations, BookingStats, BookingStatus } from '@/types/entities'
import type { PaginatedResponse } from '@/types/api'

// ============ Types ============

export interface BookingsListParams {
  page?: number
  perPage?: number
  from?: string
  to?: string
  q?: string
  status?: BookingStatus
}

export interface BookingsListResponse {
  bookings: BookingWithRelations[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

export interface CreateBookingData {
  startDate: string
  endDate: string
  propertyId: string
  clientId: string
  adults?: number
  children?: number
  basePrice: number
  totalPrice: number
  cleaningFee?: number
  taxes?: number
  discount?: number
  discountType?: 'amount' | 'percent' | null
  hasLinens?: boolean
  linensPrice?: number
  hasCleaning?: boolean
  cleaningPrice?: number
  hasCancellationInsurance?: boolean
  insuranceFee?: number
  specialRequests?: string | null
  status?: BookingStatus
}

export type UpdateBookingData = Partial<CreateBookingData>

export interface AvailabilityCheckParams {
  propertyId: string
  startDate: string
  endDate: string
  clientId?: string
  excludeBookingId?: string
}

export interface AvailabilityCheckResponse {
  available: boolean
  conflicts: Array<{
    startDate: string
    endDate: string
    clientName: string
    isSameClient: boolean
  }>
}

// ============ Service Functions ============

/**
 * Fetches the list of bookings with filters and pagination
 */
export async function getBookings(params: BookingsListParams = {}): Promise<BookingsListResponse> {
  const url = buildUrl('/api/bookings', {
    page: params.page,
    perPage: params.perPage,
    from: params.from,
    to: params.to,
    q: params.q,
    status: params.status,
  })

  return apiGet<BookingsListResponse>(url)
}

/**
 * Fetches a booking by its ID
 */
export async function getBooking(id: string): Promise<BookingWithRelations> {
  return apiGet<BookingWithRelations>(`/api/bookings/${id}`)
}

/**
 * Creates a new booking
 */
export async function createBooking(data: CreateBookingData): Promise<BookingWithRelations> {
  return apiPost<BookingWithRelations, CreateBookingData>('/api/bookings', data)
}

/**
 * Updates a booking
 */
export async function updateBooking(
  id: string,
  data: UpdateBookingData,
): Promise<BookingWithRelations> {
  return apiPatch<BookingWithRelations, UpdateBookingData>(`/api/bookings/${id}`, data)
}

/**
 * Deletes a booking
 */
export async function deleteBooking(id: string): Promise<void> {
  return apiDelete(`/api/bookings/${id}`)
}

/**
 * Deletes multiple bookings
 */
export async function deleteBookings(ids: string[]): Promise<void> {
  await Promise.all(ids.map((id) => deleteBooking(id)))
}

/**
 * Fetches booking statistics
 */
export async function getBookingStats(): Promise<BookingStats> {
  return apiGet<BookingStats>('/api/bookings/stats')
}

/**
 * Checks property availability for a given period
 */
export async function checkAvailability(
  params: AvailabilityCheckParams,
): Promise<AvailabilityCheckResponse> {
  return apiPost<AvailabilityCheckResponse, AvailabilityCheckParams>(
    '/api/bookings/check-availability',
    params,
  )
}

/**
 * Calculates the price for a booking
 */
export interface CalculatePriceParams {
  propertyId: string
  startDate: string
  endDate: string
  adults: number
  children: number
  hasLinens: boolean
  hasCleaning: boolean
  hasCancellationInsurance: boolean
  discount: number
  discountType: 'amount' | 'percent' | null
}

export interface PriceCalculation {
  basePrice: number
  linensPrice: number
  cleaningPrice: number
  insuranceFee: number
  taxes: number
  discount: number
  totalPrice: number
}

export async function calculatePrice(params: CalculatePriceParams): Promise<PriceCalculation> {
  return apiPost<PriceCalculation, CalculatePriceParams>('/api/bookings/calculate-price', params)
}
