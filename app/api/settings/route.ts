/**
 * Settings API Routes
 * Handles application settings
 */

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, requireAdmin } from '@/lib/auth'
import { handleApiError, successResponse } from '@/lib/api-error'
import { logger } from '@/lib/logger'
import { settingsSchema } from '@/lib/validations/settings'

/**
 * GET /api/settings
 * Fetch application settings
 */
export async function GET() {
  try {
    await requireAuth()

    const settings = await prisma.settings.findFirst()

    if (!settings) {
      // Create default settings if none exist
      const newSettings = await prisma.settings.create({
        data: {},
      })
      return successResponse(newSettings)
    }

    return successResponse(settings)
  } catch (error) {
    return handleApiError(error, 'Failed to fetch settings')
  }
}

/**
 * PATCH /api/settings
 * Update application settings
 */
export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const validatedData = settingsSchema.parse(body)

    // Get the first (and only) settings record
    const existingSettings = await prisma.settings.findFirst()

    if (!existingSettings) {
      // Create if doesn't exist
      const settings = await prisma.settings.create({
        data: validatedData,
      })
      logger.info('Settings created')
      return successResponse(settings)
    }

    // Update existing settings
    const settings = await prisma.settings.update({
      where: { id: existingSettings.id },
      data: validatedData,
    })

    logger.info('Settings updated')
    return successResponse(settings)
  } catch (error) {
    return handleApiError(error, 'Failed to update settings')
  }
}
