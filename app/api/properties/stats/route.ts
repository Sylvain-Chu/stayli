import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleApiError, successResponse } from '@/lib/api-error'

export async function GET() {
  try {
    await requireAuth()

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const [total, withBookings, available] = await Promise.all([
      // Total properties
      prisma.property.count(),

      // Properties with at least one booking
      prisma.property.count({
        where: {
          bookings: {
            some: {},
          },
        },
      }),

      // Properties available this month (no overlapping bookings)
      prisma.property.count({
        where: {
          bookings: {
            none: {
              AND: [{ startDate: { lte: endOfMonth } }, { endDate: { gte: startOfMonth } }],
            },
          },
        },
      }),
    ])

    const occupancyRate = total > 0 ? Math.round((withBookings / total) * 100) : 0

    return successResponse({
      total,
      withBookings,
      availableThisMonth: available,
      occupancyRate,
    })
  } catch (error) {
    return handleApiError(error, 'Failed to fetch property stats')
  }
}
