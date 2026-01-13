/**
 * Clients API Routes
 * Handles CRUD operations for clients
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleApiError, successResponse } from '@/lib/api-error'
import { logger } from '@/lib/logger'
import { clientSchema } from '@/lib/validations/client'

/**
 * GET /api/clients
 * Fetch paginated list of clients with optional search and stats
 */
export async function GET(request: NextRequest) {
  try {
    await requireAuth()

    const searchParams = request.nextUrl.searchParams
    const q = searchParams.get('q')
    const page = parseInt(searchParams.get('page') || '1')
    const perPage = parseInt(searchParams.get('perPage') || '10')
    const includeStats = searchParams.get('includeStats') === 'true'

    const where = q
      ? {
          OR: [
            { firstName: { contains: q, mode: 'insensitive' as const } },
            { lastName: { contains: q, mode: 'insensitive' as const } },
            { email: { contains: q, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.client.count({ where }),
    ])

    const response: Record<string, unknown> = {
      clients,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    }

    if (includeStats) {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

      const [newThisMonth, newLastMonth, activeThisMonth] = await Promise.all([
        prisma.client.count({
          where: { createdAt: { gte: startOfMonth } },
        }),
        prisma.client.count({
          where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
        }),
        prisma.client.count({
          where: {
            bookings: {
              some: {
                OR: [
                  {
                    startDate: {
                      gte: startOfMonth,
                      lt: new Date(now.getFullYear(), now.getMonth() + 1, 1),
                    },
                  },
                  {
                    endDate: {
                      gte: startOfMonth,
                      lt: new Date(now.getFullYear(), now.getMonth() + 1, 1),
                    },
                  },
                  {
                    AND: [
                      { startDate: { lt: startOfMonth } },
                      { endDate: { gte: new Date(now.getFullYear(), now.getMonth() + 1, 1) } },
                    ],
                  },
                ],
              },
            },
          },
        }),
      ])

      let growthPercentage = 0
      if (newLastMonth > 0) {
        growthPercentage = ((newThisMonth - newLastMonth) / newLastMonth) * 100
      } else if (newThisMonth > 0) {
        growthPercentage = 100
      }

      response.stats = {
        total,
        newThisMonth,
        growthPercentage: Math.round(growthPercentage * 10) / 10,
        activeThisMonth,
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    return handleApiError(error, 'Failed to fetch clients')
  }
}

/**
 * POST /api/clients
 * Create a new client
 */
export async function POST(request: NextRequest) {
  try {
    await requireAuth()

    const body = await request.json()
    const validatedData = clientSchema.parse(body)

    const client = await prisma.client.create({
      data: validatedData,
    })

    logger.info('Client created', { clientId: client.id })
    return successResponse(client, 201)
  } catch (error) {
    return handleApiError(error, 'Failed to create client')
  }
}
