import { z } from 'zod'

export const createUserSchema = z.object({
  name: z
    .string()
    .min(1, 'Le nom est requis')
    .max(100, 'Le nom doit contenir moins de 100 caractères')
    .nullable()
    .optional(),
  email: z.string().email('Adresse e-mail invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  role: z.enum(['ADMIN', 'USER'], { errorMap: () => ({ message: 'Rôle invalide' }) }),
})

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(1, 'Le nom est requis')
    .max(100, 'Le nom doit contenir moins de 100 caractères')
    .nullable()
    .optional(),
  email: z.string().email('Adresse e-mail invalide').optional(),
  role: z.enum(['ADMIN', 'USER']).optional(),
  password: z.union([
    z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
    z.literal(''),
  ]).optional(),
})

export const inviteUserSchema = z.object({
  email: z.string().email('Adresse e-mail invalide').optional(),
  role: z.enum(['ADMIN', 'USER'], { errorMap: () => ({ message: 'Rôle invalide' }) }),
})

export const acceptInviteSchema = z.object({
  name: z
    .string()
    .min(1, 'Le nom est requis')
    .max(100, 'Le nom doit contenir moins de 100 caractères'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  confirmPassword: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
})

export type CreateUserData = z.infer<typeof createUserSchema>
export type UpdateUserData = z.infer<typeof updateUserSchema>
export type InviteUserData = z.infer<typeof inviteUserSchema>
export type AcceptInviteData = z.infer<typeof acceptInviteSchema>
