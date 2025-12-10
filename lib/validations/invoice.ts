import { z } from 'zod'

export const invoiceSchema = z.object({
  bookingId: z.string().uuid('ID de réservation invalide'),
  issueDate: z.string().optional(),
  dueDate: z.string().min(1, "La date d'échéance est requise"),
  amount: z.number().positive('Le montant doit être positif'),
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']).optional(),
})

export type InvoiceFormData = z.infer<typeof invoiceSchema>
