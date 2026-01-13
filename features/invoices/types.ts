/**
 * Invoices Feature Types
 * Re-exports centralized types for backwards compatibility
 */

export type {
  InvoiceWithBooking as Invoice,
  InvoiceWithBooking,
  InvoiceStatus,
  InvoiceStats,
} from '@/types/entities'

// Form data type for creating/editing invoices
export interface InvoiceFormData {
  bookingId: string
  issueDate?: string
  dueDate: string
  amount: number
  status?: import('@/types/entities').InvoiceStatus
}
