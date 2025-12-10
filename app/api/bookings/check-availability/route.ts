import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { propertyId, startDate, endDate, excludeBookingId, clientId } = await request.json()

    if (!propertyId || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
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

    return NextResponse.json({
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
    console.error('Error checking availability:', error)
    return NextResponse.json({ error: 'Failed to check availability' }, { status: 500 })
  }
}
