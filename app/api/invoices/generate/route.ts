import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { generateInvoiceNumber } from '@/lib/invoice-number'

export async function POST(request: NextRequest) {
  try {
    await requireAuth()

    const { bookingId } = await request.json()

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 })
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
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Check if invoice already exists
    if (booking.invoice) {
      return NextResponse.json(
        { error: 'Invoice already exists for this booking' },
        { status: 400 },
      )
    }

    // Get settings for invoice configuration
    const settings = await prisma.settings.findFirst()
    if (!settings) {
      return NextResponse.json({ error: 'Settings not found' }, { status: 500 })
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

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    console.error('Error generating invoice:', error)
    return NextResponse.json({ error: 'Failed to generate invoice' }, { status: 500 })
  }
}
