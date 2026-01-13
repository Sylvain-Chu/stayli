/**
 * Property by ID API Routes
 * Handles single property operations
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleApiError, successResponse, ApiError } from '@/lib/api-error'
import { logger } from '@/lib/logger'
import { updatePropertySchema } from '@/lib/validations/property'

type RouteParams = { params: Promise<{ id: string }> }

/**
 * GET /api/properties/[id]
 * Fetch a single property with its bookings
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAuth()

    const { id } = await params
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        bookings: {
          include: {
            client: true,
          },
          orderBy: { startDate: 'desc' },
        },
      },
    })

    if (!property) {
      throw ApiError.notFound('Property not found')
    }

    return NextResponse.json(property)
  } catch (error) {
    return handleApiError(error, 'Failed to fetch property')
  }
}

/**
 * PATCH /api/properties/[id]
 * Update a property
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAuth()

    const { id } = await params
    const body = await request.json()
    const validatedData = updatePropertySchema.parse(body)

    const property = await prisma.property.update({
      where: { id },
      data: validatedData,
    })

    logger.info('Property updated', { propertyId: id })
    return successResponse(property)
  } catch (error) {
    return handleApiError(error, 'Failed to update property')
  }
}

/**
 * DELETE /api/properties/[id]
 * Delete a property
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAuth()

    const { id } = await params
    await prisma.property.delete({
      where: { id },
    })

    logger.info('Property deleted', { propertyId: id })
    return successResponse({ success: true })
  } catch (error) {
    return handleApiError(error, 'Failed to delete property')
  }
}
