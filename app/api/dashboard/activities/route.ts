import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') || 'current'

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    let whereClause = {}

    if (type === 'current') {
      // Séjours en cours
      whereClause = {
        startDate: { lte: now },
        endDate: { gte: now },
        status: { in: ['confirmed', 'pending'] },
      }
    } else if (type === 'arrivals') {
      // Arrivées (aujourd'hui ou demain)
      whereClause = {
        startDate: { gte: today, lt: tomorrow },
        status: { in: ['confirmed', 'pending'] },
      }
    } else if (type === 'departures') {
      // Départs (aujourd'hui ou demain)
      whereClause = {
        endDate: { gte: today, lt: tomorrow },
        status: { in: ['confirmed', 'pending'] },
      }
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        property: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { startDate: 'asc' },
      take: 10,
    })

    const activities = bookings.map((booking) => ({
      id: booking.id,
      client: {
        name: `${booking.client.firstName} ${booking.client.lastName}`,
        initials: `${booking.client.firstName.charAt(0)}${booking.client.lastName.charAt(0)}`,
      },
      property: booking.property.name,
      dates:
        type === 'current'
          ? `${new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(booking.startDate)} - ${new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(booking.endDate)}`
          : new Intl.DateTimeFormat('fr-FR', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            }).format(type === 'arrivals' ? booking.startDate : booking.endDate),
    }))

    return NextResponse.json({ activities })
  } catch (error) {
    console.error('Error fetching activities:', error)
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 })
  }
}
