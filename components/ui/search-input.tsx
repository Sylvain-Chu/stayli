'use client'

import * as React from 'react'
import { Search } from 'lucide-react'
import { Input } from './input'
import { cn } from '@/lib/utils'

/**
 * Props for SearchInput
 */
export interface SearchInputProps extends Omit<React.ComponentProps<'input'>, 'onChange'> {
  onValueChange?: (value: string) => void
  icon?: React.ReactNode
  containerClassName?: string
}

/**
 * SearchInput Component
 * Search input with an integrated icon
 */
const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, containerClassName, onValueChange, icon, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onValueChange?.(e.target.value)
    }

    return (
      <div className={cn('relative', containerClassName)}>
        <div className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2">
          {icon ?? <Search className="h-4 w-4" />}
        </div>
        <Input ref={ref} className={cn('pl-10', className)} onChange={handleChange} {...props} />
      </div>
    )
  },
)

SearchInput.displayName = 'SearchInput'

export { SearchInput }
