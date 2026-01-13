/**
 * Client by ID API Routes
 * Handles single client operations
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleApiError, successResponse, ApiError } from '@/lib/api-error'
import { logger } from '@/lib/logger'
import { updateClientSchema } from '@/lib/validations/client'

type RouteParams = { params: Promise<{ id: string }> }

/**
 * GET /api/clients/[id]
 * Fetch a single client with their bookings
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAuth()

    const { id } = await params
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        bookings: {
          include: {
            property: true,
          },
          orderBy: { startDate: 'desc' },
        },
      },
    })

    if (!client) {
      throw ApiError.notFound('Client not found')
    }

    return NextResponse.json(client)
  } catch (error) {
    return handleApiError(error, 'Failed to fetch client')
  }
}

/**
 * PATCH /api/clients/[id]
 * Update a client
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAuth()

    const { id } = await params
    const body = await request.json()
    const validatedData = updateClientSchema.parse(body)

    const client = await prisma.client.update({
      where: { id },
      data: validatedData,
    })

    logger.info('Client updated', { clientId: id })
    return successResponse(client)
  } catch (error) {
    return handleApiError(error, 'Failed to update client')
  }
}

/**
 * DELETE /api/clients/[id]
 * Delete a client
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAuth()

    const { id } = await params
    await prisma.client.delete({
      where: { id },
    })

    logger.info('Client deleted', { clientId: id })
    return successResponse({ success: true })
  } catch (error) {
    return handleApiError(error, 'Failed to delete client')
  }
}
