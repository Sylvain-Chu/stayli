import { z } from 'zod'

/**
 * Settings validation schema
 * Used for updating application settings
 */
export const settingsSchema = z.object({
  companyName: z.string().optional(),
  companyEmail: z.string().email('Adresse e-mail invalide').optional().or(z.literal('')),
  companyPhoneNumber: z.string().optional(),
  companyAddress: z.string().optional(),
  companyZipCode: z.string().optional(),
  companyCity: z.string().optional(),
  companySiret: z.string().optional(),
  companyLogoUrl: z.string().optional(),
  defaultLanguage: z.string().optional(),
  currencyCode: z.string().optional(),
  currencySymbol: z.string().optional(),
  lowSeasonMonths: z.array(z.number()).optional(),
  lowSeasonRate: z.number().nonnegative().optional(),
  highSeasonRate: z.number().nonnegative().optional(),
  linensOptionPrice: z.number().nonnegative().optional(),
  cleaningOptionPrice: z.number().nonnegative().optional(),
  touristTaxRatePerPersonPerDay: z.number().min(0).optional(),
  invoicePrefix: z.string().optional(),
  invoiceDueDays: z.number().min(0).optional(),
  invoicePaymentInstructions: z.string().optional(),
  cancellationInsurancePercentage: z.number().min(0).max(100).optional(),
  cancellationInsuranceProviderName: z.string().optional(),
})

export type SettingsFormData = z.infer<typeof settingsSchema>
