/**
 * Properties API Routes
 * Handles CRUD operations for rental properties
 */

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleApiError, successResponse } from '@/lib/api-error'
import { logger } from '@/lib/logger'
import { propertySchema } from '@/lib/validations/property'
import { applyRateLimit } from '@/lib/rate-limit'

/**
 * GET /api/properties
 * Fetch paginated list of properties with revenue calculation
 */
export async function GET(request: NextRequest) {
  try {
    await requireAuth()

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const perPage = parseInt(searchParams.get('perPage') || '10')
    const search = searchParams.get('search') || searchParams.get('q') || ''
    const sortBy = searchParams.get('sortBy')
    const sortDir = searchParams.get('sortDir') === 'asc' ? 'asc' : 'desc'

    const allowedSortFields: Record<string, any> = {
      name: { name: sortDir },
      createdAt: { createdAt: sortDir },
    }
    const orderBy = (sortBy && allowedSortFields[sortBy]) || { createdAt: 'desc' }

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { address: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const [propertiesRaw, total] = await Promise.all([
      prisma.property.findMany({
        where,
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy,
        include: {
          _count: {
            select: { bookings: true },
          },
          bookings: {
            select: {
              totalPrice: true,
            },
          },
        },
      }),
      prisma.property.count({ where }),
    ])

    // Calculate revenue for each property
    const properties = propertiesRaw.map((property) => {
      const revenue = property.bookings.reduce((sum, booking) => sum + booking.totalPrice, 0)
      const { bookings, ...propertyData } = property
      return {
        ...propertyData,
        revenue,
      }
    })

    return successResponse({
      properties,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    })
  } catch (error) {
    return handleApiError(error, 'Failed to fetch properties')
  }
}

/**
 * POST /api/properties
 * Create a new property
 */
export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    await applyRateLimit('POST:/api/properties')

    const body = await request.json()
    const validatedData = propertySchema.parse(body)

    const property = await prisma.property.create({
      data: validatedData,
    })

    logger.info('Property created', { propertyId: property.id })
    return successResponse(property, 201)
  } catch (error) {
    return handleApiError(error, 'Failed to create property')
  }
}
