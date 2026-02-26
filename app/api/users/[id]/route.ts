import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { handleApiError, successResponse, ApiError } from '@/lib/api-error'
import { logger } from '@/lib/logger'
import { updateUserSchema } from '@/lib/validations/user'
import { applyRateLimit } from '@/lib/rate-limit'
import bcrypt from 'bcrypt'

/**
 * PATCH /api/users/[id]
 * Update a user
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin()
    await applyRateLimit('PATCH:/api/users/[id]')

    const { id } = await params
    const body = await request.json()
    const validatedData = updateUserSchema.parse(body)

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true },
    })

    if (!user) {
      throw ApiError.notFound('Utilisateur')
    }

    // Check if email is being changed and if it's already taken
    if (validatedData.email && validatedData.email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email },
      })

      if (existingUser) {
        throw ApiError.conflict('Un utilisateur avec cet e-mail existe déjà')
      }
    }

    // Hash password if provided
    const updateData: any = {
      ...(validatedData.name !== undefined && { name: validatedData.name }),
      ...(validatedData.email && { email: validatedData.email }),
      ...(validatedData.role && { role: validatedData.role }),
    }

    if (validatedData.password) {
      updateData.passwordHash = await bcrypt.hash(validatedData.password, 12)
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    logger.info('User updated', { userId: id })
    return successResponse(updatedUser)
  } catch (error) {
    return handleApiError(error, 'Failed to update user')
  }
}

/**
 * DELETE /api/users/[id]
 * Delete a user
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin()
    await applyRateLimit('DELETE:/api/users/[id]')

    const { id } = await params

    // Prevent self-deletion
    if (id === session.user.id) {
      throw ApiError.badRequest('Vous ne pouvez pas vous supprimer vous-même')
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true },
    })

    if (!user) {
      throw ApiError.notFound('Utilisateur')
    }

    // If deleting an admin, ensure there's at least one other admin
    if (user.role === 'ADMIN') {
      const adminCount = await prisma.user.count({
        where: { role: 'ADMIN' },
      })

      if (adminCount <= 1) {
        throw ApiError.badRequest('Il doit y avoir au moins un administrateur')
      }
    }

    // Delete user
    await prisma.user.delete({
      where: { id },
    })

    logger.info('User deleted', { userId: id })
    return successResponse({ success: true })
  } catch (error) {
    return handleApiError(error, 'Failed to delete user')
  }
}
