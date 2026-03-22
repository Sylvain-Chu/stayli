import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleApiError, successResponse } from '@/lib/api-error'
import type { MonthlyDataPoint } from '@/types/entities'

export async function GET() {
  try {
    await requireAuth()

    const now = new Date()
    const monthsData: MonthlyDataPoint[] = []

    // Build 12 month ranges from 12 months ago to today
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const startOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
      const endOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59)

      // Fetch revenue and expenses in parallel
      const [bookingResult, expenseResult] = await Promise.all([
        prisma.booking.aggregate({
          where: {
            startDate: { gte: startOfMonth, lte: endOfMonth },
            status: { in: ['confirmed', 'pending'] },
          },
          _sum: { totalPrice: true },
        }),
        prisma.expense.aggregate({
          where: {
            date: { gte: startOfMonth, lte: endOfMonth },
          },
          _sum: { amount: true },
        }),
      ])

      const revenue = bookingResult._sum.totalPrice || 0
      const expenses = expenseResult._sum.amount || 0

      // Format month name in French
      const monthName = new Intl.DateTimeFormat('fr-FR', { month: 'short' }).format(startOfMonth)

      monthsData.push({
        month: monthName,
        year: startOfMonth.getFullYear(),
        revenue,
        expenses,
        netProfit: revenue - expenses,
      })
    }

    return successResponse({ data: monthsData })
  } catch (error) {
    return handleApiError(error, 'Failed to fetch revenue vs expenses data')
  }
}
