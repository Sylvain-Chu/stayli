import { z } from 'zod'

/**
 * Property validation schema
 * Used for creating and updating properties
 */
export const propertySchema = z.object({
  name: z
    .string()
    .min(1, 'Le nom de la propriété est requis')
    .max(200, 'Le nom de la propriété est trop longue'),
  address: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  contractDescription: z.string().optional().or(z.literal('')),
})

/**
 * Partial schema for PATCH operations
 */
export const updatePropertySchema = propertySchema.partial()

export type PropertyFormData = z.infer<typeof propertySchema>
export type UpdatePropertyFormData = z.infer<typeof updatePropertySchema>
