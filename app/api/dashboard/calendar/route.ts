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

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      throw ApiError.badRequest('Invalid year or month parameter')
    }

    // Créer les dates de début et fin du mois (0-indexed pour le mois)
    const startOfMonth = new Date(year, month - 1, 1)
    const endOfMonth = new Date(year, month, 0)

    // Récupérer toutes les réservations qui se chevauchent avec ce mois
    const bookings = await prisma.booking.findMany({
      where: {
        OR: [
          {
            AND: [{ startDate: { gte: startOfMonth } }, { startDate: { lte: endOfMonth } }],
          },
          {
            AND: [{ endDate: { gte: startOfMonth } }, { endDate: { lte: endOfMonth } }],
          },
          {
            AND: [{ startDate: { lte: startOfMonth } }, { endDate: { gte: endOfMonth } }],
          },
        ],
        status: { in: ['confirmed', 'pending', 'blocked'] },
      },
      select: {
        startDate: true,
        endDate: true,
      },
    })

    // Calculer quels jours du mois sont occupés
    const occupiedDays = new Set<number>()

    bookings.forEach((booking) => {
      // Déterminer la plage de dates dans le mois
      const bookingStart = booking.startDate > startOfMonth ? booking.startDate : startOfMonth
      const bookingEnd = booking.endDate < endOfMonth ? booking.endDate : endOfMonth

      // Itérer sur chaque jour de la réservation
      for (let d = new Date(bookingStart); d <= bookingEnd; d.setDate(d.getDate() + 1)) {
        if (d >= startOfMonth && d <= endOfMonth) {
          occupiedDays.add(d.getDate())
        }
      }
    })

    return successResponse({
      occupiedDays: Array.from(occupiedDays).sort((a, b) => a - b),
    })
  } catch (error) {
    return handleApiError(error, 'Failed to fetch calendar data')
  }
}
