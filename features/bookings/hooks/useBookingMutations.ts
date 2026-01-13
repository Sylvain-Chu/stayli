/**
 * useBookingMutations Hook
 * Hook for mutation operations (create, update, delete)
 *
 * Separated from read hooks to comply with the Single Responsibility Principle
 */

import { useCallback, useState } from 'react'
import { useSWRConfig } from 'swr'
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
  const { mutate: globalMutate } = useSWRConfig()
  const [isMutating, setIsMutating] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const invalidateBookingsCache = useCallback(() => {
    globalMutate((key) => typeof key === 'string' && key.startsWith('/api/bookings'), undefined, {
      revalidate: true,
    })
  }, [globalMutate])

  const createBooking = useCallback(
    async (data: bookingsService.CreateBookingData) => {
      setIsMutating(true)
      setError(null)

      try {
        const result = await bookingsService.createBooking(data)
        invalidateBookingsCache()
        return result
      } catch (e) {
        const err = e instanceof Error ? e : new Error('Error during creation')
        setError(err)
        throw err
      } finally {
        setIsMutating(false)
      }
    },
    [invalidateBookingsCache],
  )

  const updateBooking = useCallback(
    async (id: string, data: bookingsService.UpdateBookingData) => {
      setIsMutating(true)
      setError(null)

      try {
        const result = await bookingsService.updateBooking(id, data)
        invalidateBookingsCache()
        return result
      } catch (e) {
        const err = e instanceof Error ? e : new Error('Error during update')
        setError(err)
        throw err
      } finally {
        setIsMutating(false)
      }
    },
    [invalidateBookingsCache],
  )

  const deleteBooking = useCallback(
    async (id: string) => {
      setIsMutating(true)
      setError(null)

      try {
        await bookingsService.deleteBooking(id)
        invalidateBookingsCache()
      } catch (e) {
        const err = e instanceof Error ? e : new Error('Error during deletion')
        setError(err)
        throw err
      } finally {
        setIsMutating(false)
      }
    },
    [invalidateBookingsCache],
  )

  const deleteBookings = useCallback(
    async (ids: string[]) => {
      setIsMutating(true)
      setError(null)

      try {
        await bookingsService.deleteBookings(ids)
        invalidateBookingsCache()
      } catch (e) {
        const err = e instanceof Error ? e : new Error('Error during multiple deletion')
        setError(err)
        throw err
      } finally {
        setIsMutating(false)
      }
    },
    [invalidateBookingsCache],
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    createBooking,
    updateBooking,
    deleteBooking,
    deleteBookings,
    isMutating,
    error,
    clearError,
  }
}
