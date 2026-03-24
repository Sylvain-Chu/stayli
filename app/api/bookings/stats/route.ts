import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { BookingStatus } from '@prisma/client'
import { requireAuth } from '@/lib/auth'
import { handleApiError, successResponse } from '@/lib/api-error'

export async function GET(request: NextRequest) {
  try {
    await requireAuth()

    const searchParams = request.nextUrl.searchParams
    const from = searchParams.get('from') ? new Date(searchParams.get('from')!) : undefined
    const to = searchParams.get('to') ? new Date(searchParams.get('to')!) : undefined

    const dateFilter = from || to ? { startDate: { ...(from && { gte: from }), ...(to && { lte: to }) } } : {}

    const [total, confirmed, pending, cancelled, revenueData] = await Promise.all([
      prisma.booking.count({ where: dateFilter }),
      prisma.booking.count({ where: { ...dateFilter, status: BookingStatus.confirmed } }),
      prisma.booking.count({ where: { ...dateFilter, status: BookingStatus.pending } }),
      prisma.booking.count({ where: { ...dateFilter, status: BookingStatus.cancelled } }),
      prisma.booking.aggregate({
        where: { ...dateFilter, status: { in: [BookingStatus.confirmed, BookingStatus.pending] } },
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
