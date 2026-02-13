/**
 * Password Change API Route
 * Handles password updates
 */

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleApiError, successResponse, ApiError } from '@/lib/api-error'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import bcrypt from 'bcrypt'

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
 * POST /api/account/password
 * Change user password
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()

    const body = await request.json()
    const validatedData = passwordSchema.parse(body)

    // Get user with password hash
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      throw ApiError.notFound('Utilisateur')
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(validatedData.currentPassword, user.passwordHash)

    if (!isPasswordValid) {
      throw ApiError.badRequest('Le mot de passe actuel est incorrect')
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(validatedData.newPassword, 12)

    // Update password
    await prisma.user.update({
      where: { id: session.user.id },
      data: { passwordHash: newPasswordHash },
    })

    logger.info(`Password changed for user: ${user.id}`)
    return successResponse({ message: 'Mot de passe mis à jour avec succès' })
  } catch (error) {
    return handleApiError(error, 'Failed to change password')
  }
}
