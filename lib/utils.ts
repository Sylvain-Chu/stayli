import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge class names conditionally
 * @param inputs
 * @returns Merged className string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency value
 * @param amount
 * @param currency
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
  }).format(amount)
}

/**
 * Format date to DD/MM/YYYY
 * @param date
 * @returns DD/MM/YYYY string
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d)
}

/**
 * Format date and time to DD/MM/YYYY HH:MM
 * @param date
 * @returns DD/MM/YYYY HH:MM string
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

/**
 * Get initials from a name string
 * @param name - Full name or first name
 * @param lastName - Optional last name (for separate first/last name params)
 * @returns Uppercase initials (1-2 characters)
 */
export function getInitials(name?: string | null, lastName?: string | null): string {
  if (lastName !== undefined) {
    if (!name || !lastName) return 'NA'
    return `${name.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  if (!name) return 'U'
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

/**
 * Format French phone number with +33 prefix
 * @param value - Raw phone input
 * @returns Formatted phone number
 */
export function formatPhoneNumber(value: string): string {
  const cleaned = value.replace(/[^\d+]/g, '')

  if (cleaned.startsWith('+33')) {
    const digits = cleaned.slice(3).replace(/\D/g, '').slice(0, 9)
    if (digits.length === 0) return '+33'

    const parts = []
    if (digits.length > 0) parts.push(digits.slice(0, 1))
    if (digits.length > 1) parts.push(digits.slice(1, 3))
    if (digits.length > 3) parts.push(digits.slice(3, 5))
    if (digits.length > 5) parts.push(digits.slice(5, 7))
    if (digits.length > 7) parts.push(digits.slice(7, 9))

    return '+33 ' + parts.join(' ')
  }

  if (cleaned.startsWith('0')) {
    const digits = cleaned.slice(1).replace(/\D/g, '').slice(0, 9)
    if (digits.length === 0) return '+33'

    const parts = []
    if (digits.length > 0) parts.push(digits.slice(0, 1))
    if (digits.length > 1) parts.push(digits.slice(1, 3))
    if (digits.length > 3) parts.push(digits.slice(3, 5))
    if (digits.length > 5) parts.push(digits.slice(5, 7))
    if (digits.length > 7) parts.push(digits.slice(7, 9))

    return '+33 ' + parts.join(' ')
  }

  const digits = cleaned.replace(/\D/g, '').slice(0, 9)
  if (digits.length === 0) return ''

  const parts = []
  if (digits.length > 0) parts.push(digits.slice(0, 1))
  if (digits.length > 1) parts.push(digits.slice(1, 3))
  if (digits.length > 3) parts.push(digits.slice(3, 5))
  if (digits.length > 5) parts.push(digits.slice(5, 7))
  if (digits.length > 7) parts.push(digits.slice(7, 9))

  return '+33 ' + parts.join(' ')
}

/**
 * Validate French phone number
 * @param phone - Phone number to validate
 * @returns true if valid French phone number
 */
export function isValidFrenchPhone(phone: string): boolean {
  const cleaned = phone.replace(/\s/g, '')
  // +33 followed by 9 digits (first digit 1-9)
  return /^\+33[1-9]\d{8}$/.test(cleaned)
}

/**
 * Format SIRET number (14 digits: SIREN 9 + NIC 5)
 * @param value - Raw SIRET input
 * @returns Formatted SIRET: XXX XXX XXX XXXXX
 */
export function formatSiret(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 14)

  if (digits.length === 0) return ''

  const parts = []
  if (digits.length > 0) parts.push(digits.slice(0, 3))
  if (digits.length > 3) parts.push(digits.slice(3, 6))
  if (digits.length > 6) parts.push(digits.slice(6, 9))
  if (digits.length > 9) parts.push(digits.slice(9, 14))

  return parts.join(' ')
}

/**
 * Validate SIRET number (14 digits)
 * @param siret - SIRET number to validate
 * @returns true if valid SIRET
 */
export function isValidSiret(siret: string): boolean {
  const digits = siret.replace(/\D/g, '')
  return digits.length === 14
}
