'use client'

import * as React from 'react'
import { ChevronDown, ChevronUp, ChevronsUpDown, Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

type SortDirection = 'asc' | 'desc' | null

interface ColumnHeaderProps {
  label: string
  sortable?: boolean
  filterable?: boolean
  filterType?: 'text' | 'select'
  filterOptions?: string[]
  sortDirection?: SortDirection
  onSort?: () => void
  filterValue?: string
  onFilterChange?: (value: string) => void
  className?: string
}

export const ColumnHeader = React.memo(function ColumnHeader({
  label,
  sortable = false,
  filterable = false,
  filterType = 'text',
  filterOptions = [],
  sortDirection = null,
  onSort,
  filterValue = '',
  onFilterChange,
  className,
}: ColumnHeaderProps) {
  const [isFilterOpen, setIsFilterOpen] = React.useState(false)

  return (
    <th
      className={cn(
        'text-muted-foreground h-11 px-4 text-left align-middle font-medium',
        className,
      )}
    >
      <div className="flex items-center gap-1">
        {sortable ? (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground -ml-3 h-8 text-xs font-semibold tracking-wide uppercase"
            onClick={onSort}
          >
            {label}
            {sortDirection === 'asc' ? (
              <ChevronUp className="ml-1 h-3.5 w-3.5" />
            ) : sortDirection === 'desc' ? (
              <ChevronDown className="ml-1 h-3.5 w-3.5" />
            ) : (
              <ChevronsUpDown className="ml-1 h-3.5 w-3.5 opacity-50" />
            )}
          </Button>
        ) : (
          <span className="text-xs font-semibold tracking-wide uppercase">{label}</span>
        )}

        {filterable && (
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Filtrer ${label.toLowerCase()}`}
                className={cn('h-6 w-6', filterValue && 'text-primary')}
              >
                <Filter className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" align="start">
              {filterType === 'text' ? (
                <div className="flex items-center gap-2">
                  <Input
                    placeholder={`Filtrer ${label.toLowerCase()}...`}
                    value={filterValue}
                    onChange={(e) => onFilterChange?.(e.target.value)}
                    className="h-8 text-sm"
                  />
                  {filterValue && (
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Effacer le filtre"
                      className="h-8 w-8 shrink-0"
                      onClick={() => onFilterChange?.('')}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-1">
                  {filterOptions.map((option) => (
                    <Button
                      key={option}
                      variant={filterValue === option ? 'secondary' : 'ghost'}
                      size="sm"
                      className="w-full justify-start text-sm"
                      onClick={() => {
                        onFilterChange?.(filterValue === option ? '' : option)
                        setIsFilterOpen(false)
                      }}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              )}
            </PopoverContent>
          </Popover>
        )}
      </div>
    </th>
  )
})

interface ActiveFiltersProps {
  filters: { key: string; label: string; value: string }[]
  onRemove: (key: string) => void
  onClearAll: () => void
}

export function ActiveFilters({ filters, onRemove, onClearAll }: ActiveFiltersProps) {
  const activeFilters = filters.filter((f) => f.value)

  if (activeFilters.length === 0) return null

  return (
    <div className="border-border bg-muted/30 flex flex-wrap items-center gap-2 border-b px-4 py-2">
      <span className="text-muted-foreground text-xs">Filtres actifs:</span>
      {activeFilters.map((filter) => (
        <div
          key={filter.key}
          className="bg-primary/10 text-primary flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
        >
          <span>{filter.label}:</span>
          <span className="font-semibold">{filter.value}</span>
          <button
            onClick={() => onRemove(filter.key)}
            className="hover:bg-primary/20 ml-0.5 rounded-full p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
      <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={onClearAll}>
        Effacer tout
      </Button>
    </div>
  )
}
