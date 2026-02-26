import { NextRequest } from 'next/server'
import crypto from 'crypto'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { applyRateLimit } from '@/lib/rate-limit'
import { inviteUserSchema } from '@/lib/validations/user'
import { handleApiError, successResponse } from '@/lib/api-error'

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin()

    // Rate limit
    await applyRateLimit('POST:/api/users/invite')

    // Parse and validate request body
    const body = await request.json()
    const data = inviteUserSchema.parse(body)

    // Generate invitation token
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create invitation token
    await prisma.invitationToken.create({
      data: {
        token,
        email: data.email || null,
        role: data.role,
        expiresAt,
        createdBy: session.user.id,
      },
    })

    const inviteUrl = `${process.env.APP_URL}/auth/invite/${token}`

    return successResponse({ token, inviteUrl })
  } catch (error) {
    return handleApiError(error, 'POST:/api/users/invite')
  }
}
