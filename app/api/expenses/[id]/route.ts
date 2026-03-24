/**
 * Expense by ID API Routes
 * Handles single expense operations
 */

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, requireAdmin } from '@/lib/auth'
import { handleApiError, successResponse, ApiError } from '@/lib/api-error'
import { logger } from '@/lib/logger'
import { updateExpenseSchema } from '@/lib/validations/expense'

type RouteParams = { params: Promise<{ id: string }> }

/**
 * GET /api/expenses/[id]
 * Fetch a single expense
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAuth()

    const { id } = await params
    const expense = await prisma.expense.findUnique({
      where: { id },
      include: {
        property: true,
      },
    })

    if (!expense) {
      throw ApiError.notFound('Expense not found')
    }

    return successResponse(expense)
  } catch (error) {
    return handleApiError(error, 'Failed to fetch expense')
  }
}

/**
 * PATCH /api/expenses/[id]
 * Update an expense
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAuth()

    const { id } = await params
    const body = await request.json()
    const validatedData = updateExpenseSchema.parse(body)

    // Verify expense exists
    const existingExpense = await prisma.expense.findUnique({
      where: { id },
    })
    if (!existingExpense) {
      throw ApiError.notFound('Expense not found')
    }

    // Verify property exists if propertyId is being updated
    if (validatedData.propertyId) {
      const property = await prisma.property.findUnique({
        where: { id: validatedData.propertyId },
      })
      if (!property) {
        throw ApiError.badRequest('Propriété non trouvée')
      }
    }

    const expense = await prisma.expense.update({
      where: { id },
      data: {
        propertyId: validatedData.propertyId,
        amount: validatedData.amount,
        category: validatedData.category,
        description: validatedData.description !== undefined ? (validatedData.description || null) : undefined,
        date: validatedData.date ? new Date(validatedData.date) : undefined,
        supplier: validatedData.supplier !== undefined ? (validatedData.supplier || null) : undefined,
      },
      include: {
        property: true,
      },
    })

    logger.info('Expense updated', { expenseId: id })
    return successResponse(expense)
  } catch (error) {
    return handleApiError(error, 'Failed to update expense')
  }
}

/**
 * DELETE /api/expenses/[id]
 * Delete an expense
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin()

    const { id } = await params

    // Verify expense exists
    const expense = await prisma.expense.findUnique({
      where: { id },
    })
    if (!expense) {
      throw ApiError.notFound('Expense not found')
    }

    await prisma.expense.delete({
      where: { id },
    })

    logger.info('Expense deleted', { expenseId: id })
    return successResponse({ success: true })
  } catch (error) {
    return handleApiError(error, 'Failed to delete expense')
  }
}
