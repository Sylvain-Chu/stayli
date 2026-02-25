import { NextRequest } from 'next/server'
import { priceCalculator } from '@/lib/booking-price-calculator'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleApiError, successResponse, ApiError } from '@/lib/api-error'
import { calculatePriceSchema } from '@/lib/validations/booking'

export async function POST(request: NextRequest) {
  try {
    await requireAuth()

    const body = await request.json()
    const validatedData = calculatePriceSchema.parse(body)

    // Get settings for calculation
    const settings = await prisma.settings.findFirst()

    if (!settings) {
      throw ApiError.notFound('Settings')
    }

    const priceBreakdown = priceCalculator.calculate({
      startDate: new Date(validatedData.startDate),
      endDate: new Date(validatedData.endDate),
      adults: validatedData.adults,
      children: validatedData.children,
      baseRateLowSeason: settings.lowSeasonRate,
      baseRateHighSeason: settings.highSeasonRate,
      lowSeasonMonths: settings.lowSeasonMonths,
      hasLinens: validatedData.hasLinens,
      linensPrice: settings.linensOptionPrice,
      hasCleaning: validatedData.hasCleaning,
      cleaningPrice: settings.cleaningOptionPrice,
      discount: validatedData.discount,
      discountType: validatedData.discountType || null,
      hasCancellationInsurance: validatedData.hasCancellationInsurance,
      insuranceRate: settings.cancellationInsurancePercentage,
      touristTaxRate: settings.touristTaxRatePerPersonPerDay,
    })

    return successResponse(priceBreakdown)
  } catch (error) {
    return handleApiError(error, 'Failed to calculate price')
  }
}
