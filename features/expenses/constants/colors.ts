import type { ExpenseCategory } from '../types'

// Hex values matching Tailwind color palette for consistency across the app
export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  energy: '#d97706', // amber-600
  materials: '#2563eb', // blue-600
  maintenance: '#dc2626', // red-600
  insurance: '#9333ea', // purple-600
}
