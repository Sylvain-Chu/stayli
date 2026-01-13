import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { BookingStatus } from '@prisma/client'

export async function GET() {
  try {
    const [total, confirmed, pending, cancelled, revenueData] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({ where: { status: BookingStatus.confirmed } }),
      prisma.booking.count({ where: { status: BookingStatus.pending } }),
      prisma.booking.count({ where: { status: BookingStatus.cancelled } }),
      prisma.booking.aggregate({
        where: { status: { in: [BookingStatus.confirmed, BookingStatus.pending] } },
        _sum: { totalPrice: true },
        _avg: { totalPrice: true },
      }),
    ])

    return NextResponse.json({
      total,
      confirmed,
      pending,
      cancelled,
      totalRevenue: revenueData._sum.totalPrice || 0,
      averagePrice: revenueData._avg.totalPrice || 0,
    })
  } catch (error) {
    console.error('Error fetching booking stats:', error)
    return NextResponse.json({ error: 'Failed to fetch booking stats' }, { status: 500 })
  }
}
