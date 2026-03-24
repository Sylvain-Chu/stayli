'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Plus } from 'lucide-react'
import { EXPENSE_CATEGORY_CONFIG } from '@/types/entities'
import type { ExpenseCategory } from '../types'

interface ExpensesToolbarProps {
  properties: Array<{ id: string; name: string }>
  onSearchChange?: (value: string) => void
  onPropertyChange?: (propertyId: string) => void
  onCategoryChange?: (category: string) => void
  onAddClick?: () => void
}

export function ExpensesToolbar({ properties, onSearchChange, onPropertyChange, onCategoryChange, onAddClick }: ExpensesToolbarProps) {
  const [search, setSearch] = useState('')
  const [propertyId, setPropertyId] = useState('')
  const [category, setCategory] = useState('')

  const handleSearchChange = (value: string) => {
    setSearch(value)
    onSearchChange?.(value)
  }

  const handlePropertyChange = (value: string) => {
    const newPropertyId = value === 'all' ? '' : value
    setPropertyId(newPropertyId)
    onPropertyChange?.(newPropertyId)
  }

  const handleCategoryChange = (value: string) => {
    const newCategory = value === 'all' ? '' : value
    setCategory(newCategory)
    onCategoryChange?.(newCategory)
  }

  return (
    <div className="border-border bg-card flex items-center justify-between rounded-lg border p-4">
      <div className="flex flex-1 items-center gap-4">
        <div className="relative max-w-md flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Rechercher une dépense..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={propertyId} onValueChange={handlePropertyChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Toutes les propriétés" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les propriétés</SelectItem>
            {properties.map((prop) => (
              <SelectItem key={prop.id} value={prop.id}>
                {prop.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Toutes les catégories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {(Object.entries(EXPENSE_CATEGORY_CONFIG) as [ExpenseCategory, any][]).map(
              ([key, config]) => (
                <SelectItem key={key} value={key}>
                  {config.label}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
      </div>

      <Button onClick={onAddClick} className="bg-primary hover:bg-primary/90">
        <Plus className="mr-2 h-4 w-4" />
        Ajouter une dépense
      </Button>
    </div>
  )
}
