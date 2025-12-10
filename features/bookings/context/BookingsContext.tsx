'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface BookingsContextType {
  selectedIds: string[]
  toggleSelection: (id: string) => void
  selectAll: (ids: string[]) => void
  clearSelection: () => void
}

const BookingsContext = createContext<BookingsContextType | undefined>(undefined)

export function BookingsProvider({ children }: { children: ReactNode }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const selectAll = (ids: string[]) => {
    setSelectedIds(ids)
  }

  const clearSelection = () => {
    setSelectedIds([])
  }

  return (
    <BookingsContext.Provider value={{ selectedIds, toggleSelection, selectAll, clearSelection }}>
      {children}
    </BookingsContext.Provider>
  )
}

export function useBookingsContext() {
  const context = useContext(BookingsContext)
  if (!context) {
    throw new Error('useBookingsContext must be used within BookingsProvider')
  }
  return context
}
