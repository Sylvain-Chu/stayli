/**
 * Invoice by ID API Routes
 * Handles single invoice operations
 */

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleApiError, successResponse, ApiError } from '@/lib/api-error'
import { logger } from '@/lib/logger'
import { updateInvoiceSchema } from '@/lib/validations/invoice'

type RouteParams = { params: Promise<{ id: string }> }

/**
 * GET /api/invoices/[id]
 * Fetch a single invoice with booking details
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAuth()

    const { id } = await params
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            client: true,
            property: true,
          },
        },
      },
    })

    if (!invoice) {
      throw ApiError.notFound('Invoice not found')
    }

    return successResponse(invoice)
  } catch (error) {
    return handleApiError(error, 'Failed to fetch invoice')
  }
}

/**
 * PATCH /api/invoices/[id]
 * Update an invoice
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAuth()

    const { id } = await params
    const body = await request.json()
    const validatedData = updateInvoiceSchema.parse(body)

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        status: validatedData.status,
        issueDate: validatedData.issueDate ? new Date(validatedData.issueDate) : undefined,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
        amount: validatedData.amount,
      },
      include: {
        booking: {
          include: {
            client: true,
            property: true,
          },
        },
      },
    })

    logger.info('Invoice updated', { invoiceId: id })
    return successResponse(invoice)
  } catch (error) {
    return handleApiError(error, 'Failed to update invoice')
  }
}

/**
 * DELETE /api/invoices/[id]
 * Delete an invoice
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAuth()

    const { id } = await params
    await prisma.invoice.delete({
      where: { id },
    })

    logger.info('Invoice deleted', { invoiceId: id })
    return successResponse({ success: true })
  } catch (error) {
    return handleApiError(error, 'Failed to delete invoice')
  }
}
