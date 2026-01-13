'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface ClientsContextType {
  selectedIds: string[]
  setSelectedIds: (ids: string[]) => void
  clearSelection: () => void
  toggleSelection: (id: string) => void
  selectAll: (ids: string[]) => void
}

const ClientsContext = createContext<ClientsContextType | undefined>(undefined)

export function ClientsProvider({ children }: { children: ReactNode }) {
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
    <ClientsContext.Provider
      value={{
        selectedIds,
        setSelectedIds,
        clearSelection,
        toggleSelection,
        selectAll,
      }}
    >
      {children}
    </ClientsContext.Provider>
  )
}

export function useClientsContext() {
  const context = useContext(ClientsContext)
  if (!context) {
    throw new Error('useClientsContext must be used within ClientsProvider')
  }
  return context
}
