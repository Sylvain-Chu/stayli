import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, requireAdmin } from '@/lib/auth'
import { handleApiError, successResponse, ApiError } from '@/lib/api-error'
import { logger } from '@/lib/logger'
import { updateBookingSchema } from '@/lib/validations/booking'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth()

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
      throw ApiError.notFound('Booking')
    }

    return successResponse(booking)
  } catch (error) {
    return handleApiError(error, 'Error fetching booking')
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth()

    const { id } = await params
    const body = await request.json()
    const validatedData = updateBookingSchema.parse(body)

    const booking = await prisma.booking.update({
      where: { id },
      data: {
        ...(validatedData.startDate && { startDate: new Date(validatedData.startDate) }),
        ...(validatedData.endDate && { endDate: new Date(validatedData.endDate) }),
        ...(validatedData.totalPrice !== undefined && { totalPrice: validatedData.totalPrice }),
        ...(validatedData.basePrice !== undefined && { basePrice: validatedData.basePrice }),
        ...(validatedData.cleaningFee !== undefined && { cleaningFee: validatedData.cleaningFee }),
        ...(validatedData.taxes !== undefined && { taxes: validatedData.taxes }),
        ...(validatedData.adults !== undefined && { adults: validatedData.adults }),
        ...(validatedData.children !== undefined && { children: validatedData.children }),
        ...(validatedData.specialRequests !== undefined && {
          specialRequests: validatedData.specialRequests,
        }),
        ...(validatedData.discount !== undefined && { discount: validatedData.discount }),
        ...(validatedData.discountType !== undefined && {
          discountType: validatedData.discountType,
        }),
        ...(validatedData.hasLinens !== undefined && { hasLinens: validatedData.hasLinens }),
        ...(validatedData.linensPrice !== undefined && { linensPrice: validatedData.linensPrice }),
        ...(validatedData.hasCleaning !== undefined && { hasCleaning: validatedData.hasCleaning }),
        ...(validatedData.cleaningPrice !== undefined && {
          cleaningPrice: validatedData.cleaningPrice,
        }),
        ...(validatedData.hasCancellationInsurance !== undefined && {
          hasCancellationInsurance: validatedData.hasCancellationInsurance,
        }),
        ...(validatedData.insuranceFee !== undefined && {
          insuranceFee: validatedData.insuranceFee,
        }),
        ...(validatedData.status !== undefined && { status: validatedData.status }),
      },
      include: {
        client: true,
        property: true,
        invoice: true,
      },
    })

    logger.info('Booking updated', { bookingId: id })
    return successResponse(booking)
  } catch (error) {
    return handleApiError(error, 'Error updating booking')
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin()

    const { id } = await params

    // Delete booking and associated invoice in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.invoice.deleteMany({
        where: { bookingId: id },
      })
      await tx.booking.delete({
        where: { id },
      })
    })

    logger.info('Booking deleted', { bookingId: id })
    return successResponse({ success: true })
  } catch (error) {
    return handleApiError(error, 'Error deleting booking')
  }
}
