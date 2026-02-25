/**
 * Account API Routes
 * Handles user profile and account management
 */

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleApiError, successResponse, ApiError } from '@/lib/api-error'
import { logger } from '@/lib/logger'
import { applyRateLimit } from '@/lib/rate-limit'
import { z } from 'zod'

/**
 * Profile update schema
 */
const profileSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').optional(),
  email: z.string().email('Adresse e-mail invalide').optional(),
})

/**
 * Password update schema
 */
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Le mot de passe actuel est requis'),
    newPassword: z.string().min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères'),
    confirmPassword: z.string().min(1, 'La confirmation du mot de passe est requise'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })

/**
 * GET /api/account
 * Get current user profile
 */
export async function GET() {
  try {
    const session = await requireAuth()

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    if (!user) {
      throw ApiError.notFound('Utilisateur')
    }

    return successResponse(user)
  } catch (error) {
    return handleApiError(error, 'Failed to fetch user profile')
  }
}

/**
 * PATCH /api/account
 * Update user profile (name, email)
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAuth()
    await applyRateLimit('PATCH:/api/account')

    const body = await request.json()
    const validatedData = profileSchema.parse(body)

    // Check if email is being changed and if it's already taken
    if (validatedData.email && validatedData.email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email },
      })

      if (existingUser) {
        throw ApiError.badRequest('Cette adresse e-mail est déjà utilisée')
      }
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: validatedData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    })

    logger.info(`User profile updated: ${user.id}`)
    return successResponse(user)
  } catch (error) {
    return handleApiError(error, 'Failed to update user profile')
  }
}
