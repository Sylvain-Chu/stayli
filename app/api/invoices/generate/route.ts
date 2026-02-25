import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, requireAdmin } from '@/lib/auth'
import { handleApiError, successResponse, ApiError } from '@/lib/api-error'
import { logger } from '@/lib/logger'
import { generateInvoiceNumber } from '@/lib/invoice-number'
import { applyRateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    await applyRateLimit('POST:/api/invoices/generate')

    const { bookingId } = await request.json()

    if (!bookingId) {
      throw ApiError.badRequest('Booking ID is required')
    }

    // Get booking with relations
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        client: true,
        property: true,
        invoice: true,
      },
    })

    if (!booking) {
      throw ApiError.notFound('Booking')
    }

    // Check if invoice already exists
    if (booking.invoice) {
      throw ApiError.conflict('Invoice already exists for this booking')
    }

    // Get settings for invoice configuration
    const settings = await prisma.settings.findFirst()
    if (!settings) {
      throw ApiError.internal('Settings not found')
    }

    // Calculate due date
    const issueDate = new Date()
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + (settings.invoiceDueDays || 30))

    // Generate invoice number and create invoice in a transaction
    const invoice = await prisma.$transaction(async (tx) => {
      const invoiceNumber = await generateInvoiceNumber(tx, settings.invoicePrefix || 'INV-')

      return tx.invoice.create({
        data: {
          invoiceNumber,
          issueDate,
          dueDate,
          amount: booking.totalPrice,
          status: 'sent',
          bookingId: booking.id,
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

    logger.info('Invoice generated', {
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
    })
    return successResponse(invoice, 201)
  } catch (error) {
    return handleApiError(error, 'Failed to generate invoice')
  }
}
