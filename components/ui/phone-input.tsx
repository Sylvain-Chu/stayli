'use client'

import * as React from 'react'
import { cn, formatPhoneNumber, isValidFrenchPhone } from '@/lib/utils'
import { Input } from './input'
import { Check, Phone } from 'lucide-react'

export interface PhoneInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onChange'
> {
  value: string
  onChange: (value: string) => void
  showValidation?: boolean
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, value, onChange, showValidation = true, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)
    const isValid = isValidFrenchPhone(value)
    const displayValue = value || (isFocused ? '+33 ' : '')

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatPhoneNumber(e.target.value)
      onChange(formatted)
    }

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      if (!value) {
        onChange('+33 ')
      }
      props.onFocus?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      // Clear if only prefix
      if (value === '+33 ' || value === '+33') {
        onChange('')
      }
      props.onBlur?.(e)
    }

    return (
      <div>
        <div className="relative">
          <div className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2">
            <Phone className="h-4 w-4" />
          </div>
          <Input
            ref={ref}
            type="tel"
            value={displayValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={cn(
              'pr-10 pl-10 transition-all duration-300',
              showValidation &&
                value &&
                isValid &&
                'border-green-500 focus-visible:ring-green-500/20',
              showValidation &&
                value &&
                !isValid &&
                value.length > 4 &&
                'border-orange-400 focus-visible:ring-orange-400/20',
              className,
            )}
            placeholder="+33 6 12 34 56 78"
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
        {showValidation && value && !isValid && value.length > 4 && (
          <p className="text-muted-foreground animate-in fade-in slide-in-from-top-1 mt-1.5 text-xs duration-200">
            Format attendu : +33 X XX XX XX XX (10 chiffres)
          </p>
        )}
      </div>
    )
  },
)

PhoneInput.displayName = 'PhoneInput'

export { PhoneInput }
