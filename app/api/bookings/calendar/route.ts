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

    // Créer les dates de début et fin du mois (month est 1-indexed)
    const startOfMonth = new Date(year, month - 1, 1)
    const endOfMonth = new Date(year, month, 0, 23, 59, 59)

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
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        property: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
      orderBy: { startDate: 'asc' },
    })

    // Transformer les données pour le calendrier
    const calendarBookings = bookings.map((booking) => {
      const startDate = new Date(booking.startDate)
      const endDate = new Date(booking.endDate)

      // Calculer le jour du mois (1-31) pour startDay et endDay
      const startDay = startDate.getMonth() === month - 1 ? startDate.getDate() : 1
      const endDay =
        endDate.getMonth() === month - 1 ? endDate.getDate() : new Date(year, month, 0).getDate()

      return {
        id: booking.id,
        propertyId: booking.propertyId,
        clientId: booking.clientId,
        clientName: `${booking.client.firstName} ${booking.client.lastName}`,
        clientEmail: booking.client.email,
        clientPhone: booking.client.phone || '',
        startDay,
        endDay,
        startDate: booking.startDate.toISOString(),
        endDate: booking.endDate.toISOString(),
        status: booking.status,
        totalPrice: booking.totalPrice,
        basePrice: booking.basePrice,
        cleaningFee: booking.cleaningFee,
        taxes: booking.taxes,
        adults: booking.adults,
        children: booking.children,
        specialRequests: booking.specialRequests,
        discount: booking.discount,
        discountType: booking.discountType,
        hasLinens: booking.hasLinens,
        linensPrice: booking.linensPrice,
        hasCleaning: booking.hasCleaning,
        cleaningPrice: booking.cleaningPrice,
        hasCancellationInsurance: booking.hasCancellationInsurance,
        insuranceFee: booking.insuranceFee,
        client: booking.client,
        property: booking.property,
      }
    })

    return successResponse({ bookings: calendarBookings })
  } catch (error) {
    return handleApiError(error, 'Failed to fetch calendar bookings')
  }
}
