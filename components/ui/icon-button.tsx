'use client'

import * as React from 'react'
import { Button, buttonVariants } from './button'
import { cn } from '@/lib/utils'
import { type VariantProps } from 'class-variance-authority'

/**
 * Props for IconButton
 */
export interface IconButtonProps
  extends React.ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
  icon: React.ReactNode
  'aria-label': string
  tooltip?: string
  size?: 'icon' | 'icon-sm' | 'icon-lg'
  asChild?: boolean
}

/**
 * IconButton Component
 */
const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, icon, tooltip, size = 'icon', ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn('group relative', className)}
        title={tooltip}
        {...props}
      >
        {icon}
        {tooltip && (
          <span
            className="bg-popover text-popover-foreground pointer-events-none absolute -top-8 left-1/2 z-50 -translate-x-1/2 rounded border px-2 py-1 text-xs whitespace-nowrap opacity-0 shadow-md transition-opacity group-hover:opacity-100"
            role="tooltip"
          >
            {tooltip}
          </span>
        )}
      </Button>
    )
  },
)

IconButton.displayName = 'IconButton'

export { IconButton }
