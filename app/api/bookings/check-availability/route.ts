import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleApiError, successResponse, ApiError } from '@/lib/api-error'

export async function POST(request: NextRequest) {
  try {
    await requireAuth()

    const { propertyId, startDate, endDate, excludeBookingId, clientId } = await request.json()

    if (!propertyId || !startDate || !endDate) {
      throw ApiError.badRequest('Missing required fields')
    }

    // Check for overlapping bookings
    const conflicts = await prisma.booking.findMany({
      where: {
        propertyId,
        id: excludeBookingId ? { not: excludeBookingId } : undefined,
        status: {
          in: ['confirmed', 'pending'],
        },
        OR: [
          {
            AND: [
              { startDate: { lte: new Date(startDate) } },
              { endDate: { gt: new Date(startDate) } },
            ],
          },
          {
            AND: [
              { startDate: { lt: new Date(endDate) } },
              { endDate: { gte: new Date(endDate) } },
            ],
          },
          {
            AND: [
              { startDate: { gte: new Date(startDate) } },
              { endDate: { lte: new Date(endDate) } },
            ],
          },
        ],
      },
      include: {
        client: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    return successResponse({
      available: conflicts.length === 0,
      conflicts: conflicts.map((booking) => ({
        id: booking.id,
        startDate: booking.startDate,
        endDate: booking.endDate,
        clientName: `${booking.client.firstName} ${booking.client.lastName}`,
        clientId: booking.clientId,
        isSameClient: clientId ? booking.clientId === clientId : false,
      })),
    })
  } catch (error) {
    return handleApiError(error, 'Failed to check availability')
  }
}
