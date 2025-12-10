import { z } from 'zod'

export const clientSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis').max(100, 'Le prénom est trop long'),
  lastName: z.string().min(1, 'Le nom est requis').max(100, 'Le nom est trop long'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional().or(z.literal('')),
})

export type ClientFormData = z.infer<typeof clientSchema>
