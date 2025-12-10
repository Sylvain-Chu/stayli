import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { BookingStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const q = searchParams.get('q')
    const status = searchParams.get('status') as BookingStatus | null
    const page = parseInt(searchParams.get('page') || '1')
    const perPage = parseInt(searchParams.get('perPage') || '10')

    const where: any = {}

    if (from || to) {
      where.AND = []
      if (from) {
        where.AND.push({ startDate: { gte: new Date(from) } })
      }
      if (to) {
        where.AND.push({ endDate: { lte: new Date(to) } })
      }
    }

    if (status) {
      where.status = status
    }

    if (q) {
      where.OR = [
        { client: { firstName: { contains: q, mode: 'insensitive' as const } } },
        { client: { lastName: { contains: q, mode: 'insensitive' as const } } },
        { property: { name: { contains: q, mode: 'insensitive' as const } } },
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

    return NextResponse.json({
      bookings,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const booking = await prisma.booking.create({
      data: {
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        totalPrice: body.totalPrice,
        basePrice: body.basePrice,
        cleaningFee: body.cleaningFee || 0,
        taxes: body.taxes || 0,
        adults: body.adults || 1,
        children: body.children || 0,
        specialRequests: body.specialRequests,
        discount: body.discount || 0,
        discountType: body.discountType,
        hasLinens: body.hasLinens || false,
        linensPrice: body.linensPrice || 0,
        hasCleaning: body.hasCleaning || false,
        cleaningPrice: body.cleaningPrice || 0,
        hasCancellationInsurance: body.hasCancellationInsurance || false,
        insuranceFee: body.insuranceFee || 0,
        status: body.status || 'confirmed',
        propertyId: body.propertyId,
        clientId: body.clientId,
      },
      include: {
        client: true,
        property: true,
      },
    })

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
