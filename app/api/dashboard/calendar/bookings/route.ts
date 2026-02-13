import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleApiError, successResponse, ApiError } from '@/lib/api-error'

export async function GET(request: NextRequest) {
  try {
    await requireAuth()

    const searchParams = request.nextUrl.searchParams
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString())
    const day = parseInt(searchParams.get('day') || '1')

    if (
      isNaN(year) ||
      isNaN(month) ||
      isNaN(day) ||
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > 31
    ) {
      throw ApiError.badRequest('Invalid date parameters')
    }

    // Créer la date du jour sélectionné
    const selectedDate = new Date(year, month - 1, day)
    const nextDay = new Date(year, month - 1, day + 1)

    // Récupérer toutes les réservations qui incluent ce jour
    const bookings = await prisma.booking.findMany({
      where: {
        AND: [{ startDate: { lte: nextDay } }, { endDate: { gte: selectedDate } }],
        status: { in: ['confirmed', 'pending', 'blocked'] },
      },
      include: {
        client: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        property: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { startDate: 'asc' },
    })

    const bookingsForDay = bookings.map((booking) => ({
      id: booking.id,
      clientName: `${booking.client.firstName} ${booking.client.lastName}`,
      propertyName: booking.property.name,
      startDate: booking.startDate.toISOString(),
      endDate: booking.endDate.toISOString(),
      status: booking.status,
    }))

    return successResponse({ bookings: bookingsForDay })
  } catch (error) {
    return handleApiError(error, 'Failed to fetch calendar bookings')
  }
}
