import { z } from 'zod'

export const propertySchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(200, 'Le nom est trop long'),
  address: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  contractDescription: z.string().optional().or(z.literal('')),
})

export type PropertyFormData = z.infer<typeof propertySchema>
