import { z } from 'zod'

/**
 * French phone number regex: +33 X XX XX XX XX or 0X XX XX XX XX
 */
const frenchPhoneRegex = /^(\+33\s?[1-9](\s?\d{2}){4}|0[1-9](\s?\d{2}){4})$/

/**
 * French zip code: 5 digits
 */
const frenchZipCodeRegex = /^\d{5}$/

/**
 * Client validation schema
 * Used for creating and updating clients
 */
export const clientSchema = z.object({
  firstName: z
    .string()
    .min(1, 'Le prénom est requis')
    .max(100, 'Le prénom est trop long')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Le prénom contient des caractères invalides'),
  lastName: z
    .string()
    .min(1, 'Le nom est requis')
    .max(100, 'Le nom est trop long')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Le nom contient des caractères invalides'),
  email: z.string().min(1, "L'email est requis").email('Adresse e-mail invalide'),
  phone: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (val) => !val || frenchPhoneRegex.test(val.replace(/\s/g, '').replace(/^\+33/, '+33')),
      {
        message: 'Numéro de téléphone invalide (ex: 06 12 34 56 78 ou +33 6 12 34 56 78)',
      },
    ),
  address: z.string().optional().or(z.literal('')),
  zipCode: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((val) => !val || frenchZipCodeRegex.test(val.replace(/\s/g, '')), {
      message: 'Code postal invalide (5 chiffres)',
    }),
  city: z.string().optional().or(z.literal('')),
})

/**
 * Partial schema for PATCH operations
 */
export const updateClientSchema = clientSchema.partial()

export type ClientFormData = z.infer<typeof clientSchema>
export type UpdateClientFormData = z.infer<typeof updateClientSchema>
