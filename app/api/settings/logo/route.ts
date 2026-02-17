/**
 * Logo Upload API Route
 * Handles company logo file uploads
 */

import { NextRequest } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { requireAuth } from '@/lib/auth'
import { handleApiError, successResponse, ApiError } from '@/lib/api-error'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')
const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2 MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']

export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    await applyRateLimit('POST:/api/settings/logo', RATE_LIMITS.upload)

    const formData = await request.formData()
    const file = formData.get('logo') as File | null

    if (!file) {
      throw ApiError.badRequest('Aucun fichier fourni')
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      throw ApiError.badRequest('Type de fichier non supporté. Utilisez PNG, JPEG, WebP ou SVG.')
    }

    if (file.size > MAX_FILE_SIZE) {
      throw ApiError.badRequest('Le fichier est trop volumineux (max 2 Mo)')
    }

    // Ensure upload directory exists
    await mkdir(UPLOAD_DIR, { recursive: true })

    // Generate filename: logo-{timestamp}.{ext}
    const ext = file.name.split('.').pop()?.toLowerCase() || 'png'
    const filename = `logo-${Date.now()}.${ext}`
    const filepath = path.join(UPLOAD_DIR, filename)

    // Write file
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filepath, buffer)

    const logoUrl = `/uploads/${filename}`

    // Update settings with new logo URL
    const existingSettings = await prisma.settings.findFirst()

    if (existingSettings) {
      await prisma.settings.update({
        where: { id: existingSettings.id },
        data: { companyLogoUrl: logoUrl },
      })
    } else {
      await prisma.settings.create({
        data: { companyLogoUrl: logoUrl },
      })
    }

    logger.info('Company logo uploaded', { filename })

    return successResponse({ logoUrl })
  } catch (error) {
    return handleApiError(error, 'Failed to upload logo')
  }
}
