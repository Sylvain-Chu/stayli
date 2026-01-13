import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
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

    // Generate invoice number
    const lastInvoice = await prisma.invoice.findFirst({
      orderBy: { createdAt: 'desc' },
    })

    let invoiceNumber = `${settings.invoicePrefix || 'INV'}-001`
    if (lastInvoice && lastInvoice.invoiceNumber) {
      const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-').pop() || '0')
      invoiceNumber = `${settings.invoicePrefix || 'INV'}-${String(lastNumber + 1).padStart(3, '0')}`
    }

    // Calculate due date
    const issueDate = new Date()
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + (settings.invoiceDueDays || 30))

    // Create invoice
    const invoice = await prisma.invoice.create({
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

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    console.error('Error generating invoice:', error)
    return NextResponse.json({ error: 'Failed to generate invoice' }, { status: 500 })
  }
}
