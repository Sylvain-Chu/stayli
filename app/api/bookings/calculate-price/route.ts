import { NextRequest } from 'next/server'
import { priceCalculator } from '@/lib/booking-price-calculator'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleApiError, successResponse, ApiError } from '@/lib/api-error'
import { calculatePriceSchema } from '@/lib/validations/booking'
import { applyRateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    await applyRateLimit('POST:/api/bookings/calculate-price')

    const body = await request.json()
    const validatedData = calculatePriceSchema.parse(body)

    // Get settings and property for calculation
    const [settings, property] = await Promise.all([
      prisma.settings.findFirst(),
      prisma.property.findUnique({ where: { id: validatedData.propertyId } }),
    ])

    if (!settings) {
      throw ApiError.notFound('Settings')
    }

    if (!property) {
      throw ApiError.notFound('Property')
    }

    // If a custom base price is provided, back-calculate a rate equivalent so the
    // calculator produces exactly that base price regardless of season.
    // Formula: calculator does (rate / 21) * nights, so rate = (customBasePrice / nights) * 21.
    let effectiveLowRate = settings.lowSeasonRate
    let effectiveHighRate = settings.highSeasonRate
    if (validatedData.customBasePrice) {
      const start = new Date(validatedData.startDate)
      const end = new Date(validatedData.endDate)
      const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      const rateEquivalent = (validatedData.customBasePrice / nights) * 21
      effectiveLowRate = rateEquivalent
      effectiveHighRate = rateEquivalent
    }

    const priceBreakdown = priceCalculator.calculate({
      startDate: new Date(validatedData.startDate),
      endDate: new Date(validatedData.endDate),
      adults: validatedData.adults,
      children: validatedData.children,
      baseRateLowSeason: effectiveLowRate,
      baseRateHighSeason: effectiveHighRate,
      lowSeasonMonths: settings.lowSeasonMonths,
      hasLinens: validatedData.hasLinens,
      linensPrice: settings.linensOptionPrice,
      hasCleaning: validatedData.hasCleaning,
      cleaningPrice: settings.cleaningOptionPrice,
      discount: validatedData.discount,
      discountType: validatedData.discountType || null,
      hasCancellationInsurance: validatedData.hasCancellationInsurance,
      insuranceRate: settings.cancellationInsurancePercentage,
      touristTaxRate: property.sejourTaxEnabled ? settings.touristTaxRatePerPersonPerDay : 0,
    })

    return successResponse(priceBreakdown)
  } catch (error) {
    return handleApiError(error, 'Failed to calculate price')
  }
}
