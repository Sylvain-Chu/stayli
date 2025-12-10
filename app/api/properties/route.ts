import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { propertySchema } from '@/lib/validations/property'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const perPage = parseInt(searchParams.get('perPage') || '10')
    const search = searchParams.get('search') || ''

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
        orderBy: { createdAt: 'desc' },
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

    return NextResponse.json({
      properties,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    })
  } catch (error) {
    console.error('Error fetching properties:', error)
    return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = propertySchema.parse(body)

    const property = await prisma.property.create({
      data: validatedData,
    })

    return NextResponse.json(property, { status: 201 })
  } catch (error) {
    console.error('Error creating property:', error)
    return NextResponse.json({ error: 'Failed to create property' }, { status: 500 })
  }
}
