import { NextRequest } from 'next/server'
import bcrypt from 'bcrypt'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { ApiError, handleApiError, successResponse } from '@/lib/api-error'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    // Find and validate invitation token
    const invitation = await prisma.invitationToken.findUnique({
      where: { token },
    })

    if (!invitation) {
      throw ApiError.notFound('Invitation invalide ou expirée')
    }

    // Check if token is still valid
    if (invitation.usedAt) {
      throw ApiError.badRequest('Cette invitation a déjà été utilisée')
    }

    if (invitation.expiresAt < new Date()) {
      throw ApiError.badRequest('Cette invitation a expiré')
    }

    return successResponse({
      email: invitation.email,
      role: invitation.role,
    })
  } catch (error) {
    return handleApiError(error, 'GET:/api/users/invite/[token]')
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    // Parse and validate request body
    const body = await request.json()
    // Validate but only require name and password (confirmPassword is client-side only)
    const { name, password } = z.object({
      name: z.string().min(1, 'Nom requis').max(100),
      password: z.string().min(8, '8 caractères minimum'),
    }).parse(body)

    // Find and validate invitation token
    const invitation = await prisma.invitationToken.findUnique({
      where: { token },
    })

    if (!invitation) {
      throw ApiError.notFound('Invitation invalide ou expirée')
    }

    if (invitation.usedAt) {
      throw ApiError.badRequest('Cette invitation a déjà été utilisée')
    }

    if (invitation.expiresAt < new Date()) {
      throw ApiError.badRequest('Cette invitation a expiré')
    }

    // Get email from invitation or request body
    const email = invitation.email
    if (!email) {
      throw ApiError.badRequest('Email manquant dans l\'invitation')
    }

    // Check if email is already taken
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      throw ApiError.conflict('Cet email est déjà utilisé')
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user and mark invitation as used in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email,
          name,
          passwordHash,
          role: invitation.role,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      })

      // Mark invitation as used
      await tx.invitationToken.update({
        where: { id: invitation.id },
        data: { usedAt: new Date() },
      })

      return createdUser
    })

    return successResponse(user, 201)
  } catch (error) {
    return handleApiError(error, 'POST:/api/users/invite/[token]')
  }
}
