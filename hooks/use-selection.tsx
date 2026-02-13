'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export interface SelectionContextType {
  selectedIds: string[]
  setSelectedIds: (ids: string[]) => void
  clearSelection: () => void
  toggleSelection: (id: string) => void
  selectAll: (ids: string[]) => void
}

/**
 * Factory that creates a typed selection context + provider + hook.
 *
 * Usage:
 *   const { Provider, useSelection } = createSelectionContext('Properties')
 */
export function createSelectionContext(displayName: string) {
  const Ctx = createContext<SelectionContextType | undefined>(undefined)
  Ctx.displayName = `${displayName}SelectionContext`

  function Provider({ children }: { children: ReactNode }) {
    const [selectedIds, setSelectedIds] = useState<string[]>([])

    const clearSelection = useCallback(() => setSelectedIds([]), [])

    const toggleSelection = useCallback(
      (id: string) =>
        setSelectedIds((prev) =>
          prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
        ),
      [],
    )

    const selectAll = useCallback((ids: string[]) => setSelectedIds(ids), [])

    return (
      <Ctx.Provider value={{ selectedIds, setSelectedIds, clearSelection, toggleSelection, selectAll }}>
        {children}
      </Ctx.Provider>
    )
  }
  Provider.displayName = `${displayName}SelectionProvider`

  function useSelection(): SelectionContextType {
    const ctx = useContext(Ctx)
    if (!ctx) {
      throw new Error(`use${displayName}Context must be used within ${displayName}Provider`)
    }
    return ctx
  }

  return { Provider, useSelection }
}
