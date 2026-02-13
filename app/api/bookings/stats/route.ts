import { prisma } from '@/lib/prisma'
import { BookingStatus } from '@prisma/client'
import { requireAuth } from '@/lib/auth'
import { handleApiError, successResponse } from '@/lib/api-error'

export async function GET() {
  try {
    await requireAuth()

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

    return successResponse({
      total,
      confirmed,
      pending,
      cancelled,
      totalRevenue: revenueData._sum.totalPrice || 0,
      averagePrice: revenueData._avg.totalPrice || 0,
    })
  } catch (error) {
    return handleApiError(error, 'Failed to fetch booking stats')
  }
}
