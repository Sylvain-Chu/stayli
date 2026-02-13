'use client'

import { createSelectionContext } from '@/hooks/use-selection'

const { Provider, useSelection } = createSelectionContext('Bookings')

export const BookingsProvider = Provider
export const useBookingsContext = useSelection

