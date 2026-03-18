/**
 * Expenses Stats API Route
 * Returns aggregate expense statistics
 */

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleApiError, successResponse } from '@/lib/api-error'
import type { ExpenseCategory, ExpenseStats } from '@/types/entities'

export async function GET(request: NextRequest) {
  try {
    await requireAuth()

    const searchParams = request.nextUrl.searchParams
    const propertyId = searchParams.get('propertyId') || undefined

    const allExpenses = await prisma.expense.findMany({
      where: propertyId ? { propertyId } : undefined,
      select: {
        amount: true,
        category: true,
      },
    })

    const total = allExpenses.length
    const totalAmount = allExpenses.reduce((sum, expense) => sum + expense.amount, 0)

    const byCategory: Record<ExpenseCategory, number> = {
      energy: 0,
      materials: 0,
      maintenance: 0,
      insurance: 0,
    }

    allExpenses.forEach((expense) => {
      const category = expense.category as ExpenseCategory
      byCategory[category] += expense.amount
    })

    const stats: ExpenseStats = {
      total,
      totalAmount,
      byCategory,
    }

    return successResponse(stats)
  } catch (error) {
    return handleApiError(error, 'Failed to fetch expense stats')
  }
}
