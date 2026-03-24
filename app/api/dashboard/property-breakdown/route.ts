import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleApiError, successResponse, ApiError } from '@/lib/api-error'
import type { PropertyBreakdown } from '@/types/entities'

export async function GET(request: Request) {
  try {
    await requireAuth()

    const { searchParams } = new URL(request.url)
    const yearParam = searchParams.get('year')
    const year = yearParam ? parseInt(yearParam) : new Date().getFullYear()

    if (isNaN(year)) {
      throw ApiError.badRequest('Paramètre year invalide')
    }

    const startOfYear = new Date(year, 0, 1)
    const endOfYear = new Date(year, 11, 31, 23, 59, 59)

    // Fetch properties
    const properties = await prisma.property.findMany({
      select: { id: true, name: true },
    })

    // Fetch revenue by property
    const revenueByProperty = await prisma.booking.groupBy({
      by: ['propertyId'],
      where: {
        startDate: { gte: startOfYear, lte: endOfYear },
        status: { in: ['confirmed', 'pending'] },
      },
      _sum: { totalPrice: true },
    })

    // Fetch expenses by property
    const expensesByProperty = await prisma.expense.groupBy({
      by: ['propertyId'],
      where: {
        date: { gte: startOfYear, lte: endOfYear },
      },
      _sum: { amount: true },
    })

    // Build a map for quick lookup
    const revenueMap = new Map(
      revenueByProperty.map((r) => [r.propertyId, r._sum.totalPrice || 0]),
    )
    const expenseMap = new Map(
      expensesByProperty.map((e) => [e.propertyId, e._sum.amount || 0]),
    )

    // Combine data
    const breakdown: PropertyBreakdown[] = properties.map((property) => {
      const revenue = revenueMap.get(property.id) || 0
      const expenses = expenseMap.get(property.id) || 0
      const netProfit = revenue - expenses
      const roi = expenses > 0 ? (netProfit / expenses) * 100 : null

      return {
        propertyId: property.id,
        propertyName: property.name,
        revenue,
        expenses,
        netProfit,
        roi,
      }
    })

    return successResponse({ year, data: breakdown })
  } catch (error) {
    return handleApiError(error, 'Failed to fetch property breakdown')
  }
}
