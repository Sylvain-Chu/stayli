/**
 * Invoices API Routes
 * Handles CRUD operations for invoices
 */

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleApiError, successResponse } from '@/lib/api-error'
import { logger } from '@/lib/logger'
import { invoiceSchema } from '@/lib/validations/invoice'
import { generateInvoiceNumber } from '@/lib/invoice-number'

/**
 * GET /api/invoices
 * Fetch paginated list of invoices with search
 */
export async function GET(request: NextRequest) {
  try {
    await requireAuth()

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const perPage = parseInt(searchParams.get('perPage') || '10')

    const where = search
      ? {
          OR: [
            { invoiceNumber: { contains: search, mode: 'insensitive' as const } },
            {
              booking: {
                client: {
                  OR: [
                    { firstName: { contains: search, mode: 'insensitive' as const } },
                    { lastName: { contains: search, mode: 'insensitive' as const } },
                    { email: { contains: search, mode: 'insensitive' as const } },
                  ],
                },
              },
            },
          ],
        }
      : {}

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip: (page - 1) * perPage,
        take: perPage,
        include: {
          booking: {
            include: {
              client: true,
              property: true,
            },
          },
        },
        orderBy: { issueDate: 'desc' },
      }),
      prisma.invoice.count({ where }),
    ])

    return successResponse({
      invoices,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    })
  } catch (error) {
    return handleApiError(error, 'Failed to fetch invoices')
  }
}

/**
 * POST /api/invoices
 * Create a new invoice
 */
export async function POST(request: NextRequest) {
  try {
    await requireAuth()

    const body = await request.json()
    const validatedData = invoiceSchema.parse(body)

    // Generate invoice number and create invoice in a transaction
    const invoice = await prisma.$transaction(async (tx) => {
      const invoiceNumber = await generateInvoiceNumber(tx)

      return tx.invoice.create({
        data: {
          invoiceNumber,
          issueDate: validatedData.issueDate ? new Date(validatedData.issueDate) : new Date(),
          dueDate: new Date(validatedData.dueDate),
          amount: validatedData.amount,
          status: validatedData.status || 'draft',
          bookingId: validatedData.bookingId,
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
    })

    logger.info('Invoice created', { invoiceId: invoice.id, invoiceNumber: invoice.invoiceNumber })
    return successResponse(invoice, 201)
  } catch (error) {
    return handleApiError(error, 'Failed to create invoice')
  }
}
