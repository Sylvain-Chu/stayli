import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        client: true,
        property: true,
        invoice: true,
      },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Error fetching booking:', error)
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const booking = await prisma.booking.update({
      where: { id },
      data: {
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        totalPrice: body.totalPrice,
        basePrice: body.basePrice,
        cleaningFee: body.cleaningFee,
        taxes: body.taxes,
        adults: body.adults,
        children: body.children,
        specialRequests: body.specialRequests,
        discount: body.discount,
        discountType: body.discountType,
        hasLinens: body.hasLinens,
        linensPrice: body.linensPrice,
        hasCleaning: body.hasCleaning,
        cleaningPrice: body.cleaningPrice,
        hasCancellationInsurance: body.hasCancellationInsurance,
        insuranceFee: body.insuranceFee,
        status: body.status,
      },
      include: {
        client: true,
        property: true,
        invoice: true,
      },
    })

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params

    // Delete associated invoice first if it exists
    await prisma.invoice.deleteMany({
      where: { bookingId: id },
    })

    // Then delete the booking
    await prisma.booking.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting booking:', error)
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 })
  }
}
