import { z } from 'zod'

/**
 * Invoice validation schema
 * Used for creating invoices
 */
export const invoiceSchema = z.object({
  bookingId: z.string().uuid('ID de réservation invalide'),
  issueDate: z.string().optional(),
  dueDate: z.string().min(1, "La date d'échéance est requise"),
  amount: z.number().positive('Le montant doit être positif'),
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']).optional(),
})

/**
 * Schema for updating invoice (all fields optional)
 */
export const updateInvoiceSchema = z.object({
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']).optional(),
  issueDate: z.string().optional(),
  dueDate: z.string().optional(),
  amount: z.number().positive('Le montant doit être positif').optional(),
})

export type InvoiceFormData = z.infer<typeof invoiceSchema>
export type UpdateInvoiceFormData = z.infer<typeof updateInvoiceSchema>
