'use client'

import { useState } from 'react'
import type { Booking } from '../types'

// Hook custom pour gerer les bookings
export function useBookings() {
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({})

  // TODO: Implementer la logique de fetch
  const bookings: Booking[] = []

  const filteredBookings = bookings.filter((booking) => {
    if (search && !booking.client.name.toLowerCase().includes(search.toLowerCase())) {
      return false
    }
    // Ajouter d'autres filtres...
    return true
  })

  return {
    bookings: filteredBookings,
    search,
    setSearch,
    filters,
    setFilters,
  }
}
