'use client'

import * as React from 'react'
import { Plus, Search } from 'lucide-react'
import {
  Input,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'

interface FilterOption {
  value: string
  label: string
}

interface GenericToolbarProps {
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  onAdd?: () => void
  addLabel?: string
  filters?: {
    label: string
    value: string
    options: FilterOption[]
    onChange: (value: string) => void
  }[]
  actions?: React.ReactNode
}

export function GenericToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Rechercher...',
  onAdd,
  addLabel = 'Ajouter',
  filters = [],
  actions,
}: GenericToolbarProps) {
  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <div className="flex flex-1 items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {filters.map((filter) => (
          <Select key={filter.label} value={filter.value} onValueChange={filter.onChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={filter.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              {filter.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
      </div>

      <div className="flex items-center gap-2">
        {actions}
        {onAdd && (
          <Button onClick={onAdd}>
            <Plus className="mr-2 h-4 w-4" />
            {addLabel}
          </Button>
        )}
      </div>
    </div>
  )
}
