import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, successResponse, ApiError } from '@/lib/api-error'
import { logger } from '@/lib/logger'
import bcrypt from 'bcrypt'
import { z } from 'zod'
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

const setupSchema = z.object({
  user: z.object({
    name: z.string().min(1, 'Le nom est requis'),
    email: z.string().email('Email invalide'),
    password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  }),
  settings: z.object({
    companyName: z.string().min(1, "Le nom de l'entreprise est requis"),
    companyEmail: z.string().email().optional().or(z.literal('')),
    companyPhoneNumber: z.string().optional(),
    companyAddress: z.string().optional(),
    companyCity: z.string().optional(),
    companyZipCode: z.string().optional(),
    companySiret: z.string().optional(),
    currencyCode: z.string().optional(),
    currencySymbol: z.string().optional(),
    lowSeasonRate: z.number().positive().optional(),
    highSeasonRate: z.number().positive().optional(),
    checkInTime: z.string().optional(),
    checkOutTime: z.string().optional(),
    cancellationInsurancePercentage: z.number().positive().optional(),
    cancellationInsuranceProviderName: z.string().optional(),
  }),
})

/**
 * GET /api/auth/setup
 * Check if setup is needed (no users exist)
 */
export async function GET() {
  try {
    const userCount = await prisma.user.count()

    return successResponse({
      hasUser: userCount > 0,
      needsSetup: userCount === 0,
    })
  } catch (error) {
    return handleApiError(error, 'Failed to check setup status')
  }
}

/**
 * POST /api/auth/setup
 * Create the first admin user and initial settings
 */
export async function POST(request: NextRequest) {
  try {
    await applyRateLimit('POST:/api/auth/setup', RATE_LIMITS.auth)

    // Check if users already exist
    const existingUserCount = await prisma.user.count()

    if (existingUserCount > 0) {
      throw ApiError.badRequest('Setup already completed. Please sign in.')
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = setupSchema.parse(body)

    // Hash password
    const passwordHash = await bcrypt.hash(validatedData.user.password, 12)

    // Create user and settings in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create admin user
      const user = await tx.user.create({
        data: {
          name: validatedData.user.name,
          email: validatedData.user.email,
          passwordHash,
          role: 'ADMIN',
        },
      })

      // Create or update settings
      const existingSettings = await tx.settings.findFirst()

      let settings
      const s = validatedData.settings
      const settingsData = {
        companyName: s.companyName,
        companyEmail: s.companyEmail || null,
        companyPhoneNumber: s.companyPhoneNumber || null,
        companyAddress: s.companyAddress || null,
        companyCity: s.companyCity || null,
        companyZipCode: s.companyZipCode || null,
        companySiret: s.companySiret || null,
        ...(s.currencyCode && { currencyCode: s.currencyCode }),
        ...(s.currencySymbol && { currencySymbol: s.currencySymbol }),
        ...(s.lowSeasonRate !== undefined && { lowSeasonRate: s.lowSeasonRate }),
        ...(s.highSeasonRate !== undefined && { highSeasonRate: s.highSeasonRate }),
        ...(s.checkInTime && { checkInTime: s.checkInTime }),
        ...(s.checkOutTime && { checkOutTime: s.checkOutTime }),
        ...(s.cancellationInsurancePercentage !== undefined && {
          cancellationInsurancePercentage: s.cancellationInsurancePercentage,
        }),
        ...(s.cancellationInsuranceProviderName && {
          cancellationInsuranceProviderName: s.cancellationInsuranceProviderName,
        }),
      }

      if (existingSettings) {
        settings = await tx.settings.update({
          where: { id: existingSettings.id },
          data: settingsData,
        })
      } else {
        settings = await tx.settings.create({ data: settingsData })
      }

      return { user, settings }
    })

    logger.info('Setup completed', { userId: result.user.id })
    return successResponse({
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
      },
    })
  } catch (error) {
    // Check for unique constraint violation
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return handleApiError(
        ApiError.conflict('A user with this email already exists'),
        'Setup error',
      )
    }

    return handleApiError(error, 'Failed to complete setup')
  }
}
