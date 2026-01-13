'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface PropertiesContextType {
  selectedIds: string[]
  setSelectedIds: (ids: string[]) => void
  clearSelection: () => void
  toggleSelection: (id: string) => void
  selectAll: (ids: string[]) => void
}

const PropertiesContext = createContext<PropertiesContextType | undefined>(undefined)

export function PropertiesProvider({ children }: { children: ReactNode }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const clearSelection = () => setSelectedIds([])

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id],
    )
  }

  const selectAll = (ids: string[]) => {
    setSelectedIds(ids)
  }

  return (
    <PropertiesContext.Provider
      value={{
        selectedIds,
        setSelectedIds,
        clearSelection,
        toggleSelection,
        selectAll,
      }}
    >
      {children}
    </PropertiesContext.Provider>
  )
}

export function usePropertiesContext() {
  const context = useContext(PropertiesContext)
  if (!context) {
    throw new Error('usePropertiesContext must be used within PropertiesProvider')
  }
  return context
}
