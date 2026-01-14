'use client'

import * as React from 'react'
import { cn, formatSiret, isValidSiret } from '@/lib/utils'
import { Input } from './input'
import { Check, Building2 } from 'lucide-react'

export interface SiretInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onChange'
> {
  value: string
  onChange: (value: string) => void
  showValidation?: boolean
}

const SiretInput = React.forwardRef<HTMLInputElement, SiretInputProps>(
  ({ className, value, onChange, showValidation = true, ...props }, ref) => {
    const isValid = isValidSiret(value)
    const digitCount = value.replace(/\D/g, '').length

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatSiret(e.target.value)
      onChange(formatted)
    }

    // Calculate progress for the animated bar
    const progress = Math.min((digitCount / 14) * 100, 100)

    return (
      <div>
        <div className="relative">
          <div className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2">
            <Building2 className="h-4 w-4" />
          </div>
          <Input
            ref={ref}
            type="text"
            inputMode="numeric"
            value={value}
            onChange={handleChange}
            className={cn(
              'pr-10 pl-10 transition-all duration-300',
              showValidation &&
                value &&
                isValid &&
                'border-green-500 focus-visible:ring-green-500/20',
              showValidation &&
                value &&
                !isValid &&
                digitCount > 0 &&
                'border-orange-400 focus-visible:ring-orange-400/20',
              className,
            )}
            placeholder="123 456 789 00012"
            maxLength={17} // 14 digits + 3 spaces
            {...props}
          />
          {showValidation && value && (
            <div
              className={cn(
                'pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 transition-all duration-300',
                isValid ? 'scale-100 opacity-100' : 'scale-75 opacity-0',
              )}
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white">
                <Check className="h-3 w-3" />
              </div>
            </div>
          )}
        </div>
        {showValidation && value && !isValid && (
          <div className="animate-in fade-in slide-in-from-top-1 mt-2 space-y-1 duration-200">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{digitCount}/14 chiffres</span>
              <span
                className={cn(
                  'transition-colors duration-200',
                  digitCount === 14 ? 'text-green-500' : 'text-muted-foreground',
                )}
              >
                {digitCount === 14 ? 'Complet ✓' : `${14 - digitCount} restants`}
              </span>
            </div>
            <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500 ease-out',
                  digitCount === 14 ? 'bg-green-500' : 'bg-primary',
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    )
  },
)

SiretInput.displayName = 'SiretInput'

export { SiretInput }
