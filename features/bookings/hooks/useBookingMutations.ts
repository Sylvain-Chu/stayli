/**
 * useBookingMutations Hook
 * Hook for mutation operations (create, update, delete)
 *
 * Separated from read hooks to comply with the Single Responsibility Principle
 */

import { useCallback } from 'react'
import { useMutations } from '@/hooks/use-mutations'
import * as bookingsService from '@/services/bookings.service'
import type { BookingWithRelations } from '@/types/entities'

export interface UseBookingMutationsReturn {
  createBooking: (data: bookingsService.CreateBookingData) => Promise<BookingWithRelations>
  updateBooking: (
    id: string,
    data: bookingsService.UpdateBookingData,
  ) => Promise<BookingWithRelations>
  deleteBooking: (id: string) => Promise<void>
  deleteBookings: (ids: string[]) => Promise<void>
  isMutating: boolean
  error: Error | null
  clearError: () => void
}

/**
 * Hook for booking mutation operations
 */
export function useBookingMutations(): UseBookingMutationsReturn {
  const { mutateAsync, ...state } = useMutations('/api/bookings')

  const createBooking = useCallback(
    (data: bookingsService.CreateBookingData) =>
      mutateAsync(() => bookingsService.createBooking(data)),
    [mutateAsync],
  )

  const updateBooking = useCallback(
    (id: string, data: bookingsService.UpdateBookingData) =>
      mutateAsync(() => bookingsService.updateBooking(id, data)),
    [mutateAsync],
  )

  const deleteBooking = useCallback(
    (id: string) => mutateAsync(() => bookingsService.deleteBooking(id)),
    [mutateAsync],
  )

  const deleteBookings = useCallback(
    (ids: string[]) => mutateAsync(() => bookingsService.deleteBookings(ids)),
    [mutateAsync],
  )

  return { createBooking, updateBooking, deleteBooking, deleteBookings, ...state }
}
