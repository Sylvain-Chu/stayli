'use client'

import * as React from 'react'
import { MoreHorizontal } from 'lucide-react'
import {
  Button,
  Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui'
import { ColumnHeader, ActiveFilters } from '@/components/ui/data-table'

export interface Column<T> {
  key: string
  label: string
  sortable?: boolean
  filterable?: boolean
  filterType?: 'text' | 'select'
  filterOptions?: string[]
  render?: (item: T) => React.ReactNode
  className?: string
}

export interface Action<T> {
  label: string
  icon?: React.ReactNode
  onClick: (item: T) => void
  variant?: 'default' | 'destructive'
}

interface GenericDataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  actions?: Action<T>[]
  onSelectionChange?: (selected: T[]) => void
  emptyMessage?: string
  idKey?: keyof T
}

export function GenericDataTable<T extends Record<string, any>>({
  data,
  columns,
  actions = [],
  onSelectionChange,
  emptyMessage = 'Aucune donnée disponible',
  idKey = 'id' as keyof T,
}: GenericDataTableProps<T>) {
  const [selectedItems, setSelectedItems] = React.useState<Set<string | number>>(new Set())
  const [sortState, setSortState] = React.useState<{
    column: string | null
    direction: 'asc' | 'desc' | null
  }>({ column: null, direction: null })
  const [filters, setFilters] = React.useState<Record<string, string>>({})

  const handleSelectAll = () => {
    if (selectedItems.size === data.length) {
      setSelectedItems(new Set())
      onSelectionChange?.([])
    } else {
      const allIds = new Set(data.map((item) => item[idKey]))
      setSelectedItems(allIds)
      onSelectionChange?.(data)
    }
  }

  const handleSelectItem = (item: T) => {
    const id = item[idKey]
    const newSelection = new Set(selectedItems)

    if (newSelection.has(id)) {
      newSelection.delete(id)
    } else {
      newSelection.add(id)
    }

    setSelectedItems(newSelection)
    onSelectionChange?.(data.filter((d) => newSelection.has(d[idKey])))
  }

  // Gestion du tri
  const handleSort = (columnKey: string) => {
    setSortState((prev) => {
      if (prev.column !== columnKey) {
        return { column: columnKey, direction: 'asc' }
      }
      if (prev.direction === 'asc') {
        return { column: columnKey, direction: 'desc' }
      }
      return { column: null, direction: null }
    })
  }

  // Gestion des filtres
  const handleFilterChange = (columnKey: string, value: string) => {
    setFilters((prev) => ({ ...prev, [columnKey]: value }))
  }

  const clearFilter = (columnKey: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev }
      delete newFilters[columnKey]
      return newFilters
    })
  }

  let processedData = [...data]

  Object.entries(filters).forEach(([columnKey, filterValue]) => {
    if (filterValue) {
      processedData = processedData.filter((item) => {
        const value = String(item[columnKey]).toLowerCase()
        return value.includes(filterValue.toLowerCase())
      })
    }
  })

  if (sortState.column && sortState.direction) {
    processedData.sort((a, b) => {
      const aValue = a[sortState.column!]
      const bValue = b[sortState.column!]
      const multiplier = sortState.direction === 'asc' ? 1 : -1

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue) * multiplier
      }
      return (aValue > bValue ? 1 : -1) * multiplier
    })
  }

  const hasActiveFilters = Object.keys(filters).length > 0

  return (
    <div className="space-y-4">
      {hasActiveFilters && (
        <ActiveFilters
          filters={Object.entries(filters).map(([key, value]) => ({
            key,
            label: columns.find((c) => c.key === key)?.label || key,
            value,
          }))}
          onRemove={(key: string) => {
            clearFilter(key)
          }}
          onClearAll={() => setFilters({})}
        />
      )}

      <div className="rounded-md border">
        <table className="w-full caption-bottom text-sm">
          <thead className="border-b">
            <tr className="hover:bg-muted/50 border-b transition-colors">
              {onSelectionChange && (
                <th className="h-11 w-12 px-4">
                  <Checkbox
                    checked={selectedItems.size === data.length && data.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
              )}
              {columns.map((column) => (
                <ColumnHeader
                  key={column.key}
                  label={column.label}
                  sortable={column.sortable}
                  filterable={column.filterable}
                  filterType={column.filterType}
                  filterOptions={column.filterOptions}
                  sortDirection={sortState.column === column.key ? sortState.direction : null}
                  onSort={() => handleSort(column.key)}
                  filterValue={filters[column.key] || ''}
                  onFilterChange={(value) => handleFilterChange(column.key, value)}
                  className={column.className}
                />
              ))}
              {actions.length > 0 && (
                <th className="text-muted-foreground h-11 px-4 text-left align-middle font-medium">
                  <span className="text-xs font-semibold tracking-wide uppercase">Actions</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {processedData.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    columns.length + (onSelectionChange ? 1 : 0) + (actions.length > 0 ? 1 : 0)
                  }
                  className="text-muted-foreground h-24 text-center"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              processedData.map((item) => (
                <tr
                  key={String(item[idKey])}
                  className="hover:bg-muted/50 border-b transition-colors"
                >
                  {onSelectionChange && (
                    <td className="w-12 px-4">
                      <Checkbox
                        checked={selectedItems.has(item[idKey])}
                        onCheckedChange={() => handleSelectItem(item)}
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td key={column.key} className={`px-4 py-3 ${column.className || ''}`}>
                      {column.render ? column.render(item) : String(item[column.key])}
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label="Actions">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {actions.map((action, idx) => (
                            <DropdownMenuItem
                              key={idx}
                              onClick={() => action.onClick(item)}
                              className={action.variant === 'destructive' ? 'text-destructive' : ''}
                            >
                              {action.icon}
                              {action.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
