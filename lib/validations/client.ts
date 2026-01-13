import { z } from 'zod'

/**
 * Client validation schema
 * Used for creating and updating clients
 */
export const clientSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis').max(100, 'Le prénom est trop long'),
  lastName: z.string().min(1, 'Le nom est requis').max(100, 'Le nom est trop long'),
  email: z.string().email('Adresse e-mail invalide'),
  phone: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  zipCode: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
})

/**
 * Partial schema for PATCH operations
 */
export const updateClientSchema = clientSchema.partial()

export type ClientFormData = z.infer<typeof clientSchema>
export type UpdateClientFormData = z.infer<typeof updateClientSchema>
