import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleApiError, successResponse, ApiError } from '@/lib/api-error'
import { EXPENSE_CATEGORY_CONFIG } from '@/types/entities'
import type { ExpenseCategory, ExpenseCategoryBreakdown } from '@/types/entities'

const categories: ExpenseCategory[] = ['energy', 'materials', 'maintenance', 'insurance']

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

    // Fetch expenses grouped by category
    const expensesByCategory = await prisma.expense.groupBy({
      by: ['category'],
      where: {
        date: { gte: startOfYear, lte: endOfYear },
      },
      _sum: { amount: true },
    })

    // Build map for lookup
    const categoryMap = new Map<ExpenseCategory, number>(
      expensesByCategory.map((e) => [e.category as ExpenseCategory, e._sum.amount || 0]),
    )

    // Calculate total
    let total = 0
    categoryMap.forEach((amount) => {
      total += amount
    })

    // Build response with all categories
    const data: ExpenseCategoryBreakdown[] = categories.map((category) => {
      const amount = categoryMap.get(category) || 0
      const percentage = total > 0 ? (amount / total) * 100 : 0

      return {
        category,
        label: EXPENSE_CATEGORY_CONFIG[category].label,
        amount,
        percentage,
      }
    })

    return successResponse({ year, total, data })
  } catch (error) {
    return handleApiError(error, 'Failed to fetch expense categories')
  }
}
