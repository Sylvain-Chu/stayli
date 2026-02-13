import { NextRequest, NextResponse } from 'next/server'
import { priceCalculator } from '@/lib/booking-price-calculator'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    await requireAuth()

    const body = await request.json()

    // Get settings for calculation
    const settings = await prisma.settings.findFirst()

    if (!settings) {
      return NextResponse.json({ error: 'Settings not found' }, { status: 404 })
    }

    const priceBreakdown = priceCalculator.calculate({
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      adults: body.adults || 1,
      children: body.children || 0,
      baseRateLowSeason: settings.lowSeasonRate,
      baseRateHighSeason: settings.highSeasonRate,
      lowSeasonMonths: settings.lowSeasonMonths,
      hasLinens: body.hasLinens || false,
      linensPrice: settings.linensOptionPrice,
      hasCleaning: body.hasCleaning || false,
      cleaningPrice: settings.cleaningOptionPrice,
      discount: body.discount || 0,
      discountType: body.discountType || null,
      hasCancellationInsurance: body.hasCancellationInsurance || false,
      insuranceRate: settings.cancellationInsurancePercentage,
      touristTaxRate: settings.touristTaxRatePerPersonPerDay,
    })

    return NextResponse.json(priceBreakdown)
  } catch (error) {
    console.error('Error calculating price:', error)
    return NextResponse.json({ error: 'Failed to calculate price' }, { status: 500 })
  }
}
