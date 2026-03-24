import { z } from 'zod'

/**
 * Expense validation schema
 * Used for creating and updating expenses
 */
export const expenseSchema = z.object({
  propertyId: z.string().uuid('ID de propriété invalide'),
  amount: z.number().positive('Le montant doit être positif').max(999999999, 'Le montant ne peut pas dépasser 999,999,999'),
  category: z.enum(['energy', 'materials', 'maintenance', 'insurance'], {
    errorMap: () => ({ message: 'Catégorie de dépense invalide' }),
  }),
  description: z.string().max(1000, 'La description ne peut pas dépasser 1000 caractères').optional().or(z.literal('')),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)').refine(
    (dateStr) => {
      const date = new Date(dateStr)
      const today = new Date()
      today.setHours(23, 59, 59, 999)
      return date <= today
    },
    'La date ne peut pas être dans le futur'
  ),
  supplier: z.string().max(500, 'Le fournisseur ne peut pas dépasser 500 caractères').optional().or(z.literal('')),
})

/**
 * Partial schema for PATCH operations
 */
export const updateExpenseSchema = expenseSchema.partial()

export type ExpenseFormData = z.infer<typeof expenseSchema>
export type UpdateExpenseFormData = z.infer<typeof updateExpenseSchema>
