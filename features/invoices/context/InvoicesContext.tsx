'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface InvoicesContextType {
  selectedIds: string[]
  setSelectedIds: (ids: string[]) => void
  clearSelection: () => void
  toggleSelection: (id: string) => void
  selectAll: (ids: string[]) => void
}

const InvoicesContext = createContext<InvoicesContextType | undefined>(undefined)

export function InvoicesProvider({ children }: { children: ReactNode }) {
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
    <InvoicesContext.Provider
      value={{
        selectedIds,
        setSelectedIds,
        clearSelection,
        toggleSelection,
        selectAll,
      }}
    >
      {children}
    </InvoicesContext.Provider>
  )
}

export function useInvoicesContext() {
  const context = useContext(InvoicesContext)
  if (!context) {
    throw new Error('useInvoicesContext must be used within InvoicesProvider')
  }
  return context
}
