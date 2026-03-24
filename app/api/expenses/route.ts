/**
 * Expenses API Routes
 * Handles CRUD operations for expenses
 */

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleApiError, successResponse, ApiError } from '@/lib/api-error'
import { logger } from '@/lib/logger'
import { expenseSchema } from '@/lib/validations/expense'
import { applyRateLimit } from '@/lib/rate-limit'

/**
 * GET /api/expenses
 * Fetch paginated list of expenses with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    await requireAuth()

    const searchParams = request.nextUrl.searchParams
    const search = (searchParams.get('search') || '').trim()
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const perPage = Math.min(Math.max(1, parseInt(searchParams.get('perPage') || '10')), 100)
    const propertyId = searchParams.get('propertyId') || undefined
    const category = searchParams.get('category') || undefined

    const where = {
      ...(propertyId && { propertyId }),
      ...(category && { category: category as any }),
      ...(search && {
        OR: [
          { supplier: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    }

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        skip: (page - 1) * perPage,
        take: perPage,
        include: {
          property: true,
        },
        orderBy: { date: 'desc' },
      }),
      prisma.expense.count({ where }),
    ])

    return successResponse({
      expenses,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    })
  } catch (error) {
    return handleApiError(error, 'Failed to fetch expenses')
  }
}

/**
 * POST /api/expenses
 * Create a new expense
 */
export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    await applyRateLimit('POST:/api/expenses')

    const body = await request.json()
    const validatedData = expenseSchema.parse(body)

    // Verify property exists
    const property = await prisma.property.findUnique({
      where: { id: validatedData.propertyId },
    })
    if (!property) {
      throw ApiError.badRequest('Propriété non trouvée')
    }

    const expense = await prisma.expense.create({
      data: {
        propertyId: validatedData.propertyId,
        amount: validatedData.amount,
        category: validatedData.category,
        description: validatedData.description || null,
        date: new Date(validatedData.date),
        supplier: validatedData.supplier || null,
      },
      include: {
        property: true,
      },
    })

    logger.info('Expense created', { expenseId: expense.id, propertyId: expense.propertyId })
    return successResponse(expense, 201)
  } catch (error) {
    return handleApiError(error, 'Failed to create expense')
  }
}
