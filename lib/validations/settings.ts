import { z } from 'zod'

/**
 * Settings validation schema
 * Used for updating application settings
 */
export const settingsSchema = z.object({
  companyName: z.string().optional(),
  companyEmail: z.string().email('Adresse e-mail invalide').optional().or(z.literal('')),
  companyPhone: z.string().optional(),
  companyAddress: z.string().optional(),
  companyZipCode: z.string().optional(),
  companyCity: z.string().optional(),
  companySiret: z.string().optional(),
  currency: z.string().optional(),
  defaultCheckInTime: z.string().optional(),
  defaultCheckOutTime: z.string().optional(),
  defaultCleaningFee: z.number().nonnegative().optional(),
  defaultTaxRate: z.number().min(0).max(100).optional(),
  invoicePrefix: z.string().optional(),
  invoiceNotes: z.string().optional(),
})

export type SettingsFormData = z.infer<typeof settingsSchema>
