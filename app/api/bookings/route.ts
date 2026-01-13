import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { BookingStatus, Prisma } from '@prisma/client'
import { handleApiError, successResponse } from '@/lib/api-error'
import { logger } from '@/lib/logger'
import { createBookingSchema, bookingQuerySchema } from '@/lib/validations/booking'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    const queryResult = bookingQuerySchema.safeParse({
      page: searchParams.get('page'),
      perPage: searchParams.get('perPage'),
      from: searchParams.get('from'),
      to: searchParams.get('to'),
      q: searchParams.get('q'),
      status: searchParams.get('status'),
    })

    const { page, perPage, from, to, q, status } = queryResult.success
      ? queryResult.data
      : { page: 1, perPage: 10, from: undefined, to: undefined, q: undefined, status: undefined }

    const where: Prisma.BookingWhereInput = {}

    if (from || to) {
      where.AND = []
      if (from) {
        ;(where.AND as Prisma.BookingWhereInput[]).push({ startDate: { gte: new Date(from) } })
      }
      if (to) {
        ;(where.AND as Prisma.BookingWhereInput[]).push({ endDate: { lte: new Date(to) } })
      }
    }

    if (status) {
      where.status = status as BookingStatus
    }

    if (q) {
      where.OR = [
        { client: { firstName: { contains: q, mode: 'insensitive' } } },
        { client: { lastName: { contains: q, mode: 'insensitive' } } },
        { property: { name: { contains: q, mode: 'insensitive' } } },
      ]
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip: (page - 1) * perPage,
        take: perPage,
        include: {
          client: true,
          property: true,
          invoice: true,
        },
        orderBy: { startDate: 'desc' },
      }),
      prisma.booking.count({ where }),
    ])

    logger.debug('Bookings fetched', { count: bookings.length, total, page })

    return successResponse({
      bookings,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    })
  } catch (error) {
    return handleApiError(error, 'Error fetching bookings')
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const validatedData = createBookingSchema.parse(body)

    const booking = await prisma.booking.create({
      data: {
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
        totalPrice: validatedData.totalPrice,
        basePrice: validatedData.basePrice,
        cleaningFee: validatedData.cleaningFee,
        taxes: validatedData.taxes,
        adults: validatedData.adults,
        children: validatedData.children,
        specialRequests: validatedData.specialRequests,
        discount: validatedData.discount,
        discountType: validatedData.discountType,
        hasLinens: validatedData.hasLinens,
        linensPrice: validatedData.linensPrice,
        hasCleaning: validatedData.hasCleaning,
        cleaningPrice: validatedData.cleaningPrice,
        hasCancellationInsurance: validatedData.hasCancellationInsurance,
        insuranceFee: validatedData.insuranceFee,
        status: validatedData.status,
        propertyId: validatedData.propertyId,
        clientId: validatedData.clientId,
      },
      include: {
        client: true,
        property: true,
      },
    })

    logger.info('Booking created', { bookingId: booking.id })

    return successResponse(booking, 201)
  } catch (error) {
    return handleApiError(error, 'Error creating booking')
  }
}
