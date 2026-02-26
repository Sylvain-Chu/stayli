import { describe, it, expect, beforeEach } from 'vitest'
import { BookingPriceCalculator } from '../booking-price-calculator'
import type { PriceCalculationInput } from '../booking-price-calculator'

// Base rates: 2100 for 21 days = 100/night (high), 1050/21 = 50/night (low)
const BASE_INPUT: PriceCalculationInput = {
  startDate: new Date('2025-07-01'), // July = high season
  endDate: new Date('2025-07-08'),   // 7 nights
  adults: 2,
  children: 0,
  baseRateLowSeason: 1050,
  baseRateHighSeason: 2100,
  lowSeasonMonths: [1, 2, 11, 12],
  hasLinens: false,
  linensPrice: 50,
  hasCleaning: false,
  cleaningPrice: 80,
  discount: 0,
  discountType: null,
  hasCancellationInsurance: false,
  insuranceRate: 5,
  touristTaxRate: 1.5,
}

describe('BookingPriceCalculator', () => {
  let calc: BookingPriceCalculator

  beforeEach(() => {
    calc = new BookingPriceCalculator()
  })

  describe('base price', () => {
    it('calculates high season correctly (7 nights × 100/night = 700)', () => {
      const result = calc.calculate(BASE_INPUT)
      expect(result.basePrice).toBe(700)
    })

    it('calculates low season correctly (7 nights × 50/night = 350)', () => {
      const result = calc.calculate({
        ...BASE_INPUT,
        startDate: new Date('2025-01-01'), // January = low season
        endDate: new Date('2025-01-08'),
      })
      expect(result.basePrice).toBe(350)
    })

    it('uses start month to determine season', () => {
      // Dec 29 → Jan 4: start month is December (low season)
      const result = calc.calculate({
        ...BASE_INPUT,
        startDate: new Date('2025-12-29'),
        endDate: new Date('2026-01-05'),
      })
      expect(result.basePrice).toBe(350) // low season rate
    })
  })

  describe('discount', () => {
    it('applies percent discount on base price', () => {
      const result = calc.calculate({
        ...BASE_INPUT,
        discount: 10,
        discountType: 'percent',
      })
      expect(result.discount).toBe(70) // 10% of 700
    })

    it('applies fixed amount discount', () => {
      const result = calc.calculate({
        ...BASE_INPUT,
        discount: 100,
        discountType: 'amount',
      })
      expect(result.discount).toBe(100)
    })

    it('treats null discountType as amount (falls through to amount branch)', () => {
      const result = calc.calculate({
        ...BASE_INPUT,
        discount: 50,
        discountType: null,
      })
      expect(result.discount).toBe(50)
    })

    it('ignores zero discount', () => {
      const result = calc.calculate({ ...BASE_INPUT, discount: 0, discountType: 'percent' })
      expect(result.discount).toBe(0)
    })
  })

  describe('options', () => {
    it('adds linens price when hasLinens is true', () => {
      const result = calc.calculate({ ...BASE_INPUT, hasLinens: true })
      expect(result.linensPrice).toBe(50)
    })

    it('excludes linens when hasLinens is false', () => {
      const result = calc.calculate({ ...BASE_INPUT, hasLinens: false })
      expect(result.linensPrice).toBe(0)
    })

    it('adds cleaning price when hasCleaning is true', () => {
      const result = calc.calculate({ ...BASE_INPUT, hasCleaning: true })
      expect(result.cleaningPrice).toBe(80)
    })
  })

  describe('cancellation insurance', () => {
    it('calculates insurance as % of net base price (after discount)', () => {
      const result = calc.calculate({
        ...BASE_INPUT,
        discount: 10,
        discountType: 'percent', // net = 630
        hasCancellationInsurance: true,
        insuranceRate: 5,
      })
      expect(result.insuranceFee).toBe(31.5) // 5% of 630
    })

    it('returns 0 when insurance is not selected', () => {
      const result = calc.calculate({ ...BASE_INPUT, hasCancellationInsurance: false })
      expect(result.insuranceFee).toBe(0)
    })
  })

  describe('tourist tax', () => {
    it('calculates tax as persons × nights × rate', () => {
      const result = calc.calculate({ ...BASE_INPUT, adults: 2, children: 1 })
      // 3 persons × 7 nights × 1.5 = 31.5
      expect(result.touristTax).toBe(31.5)
    })

    it('counts children in tourist tax', () => {
      const withChildren = calc.calculate({ ...BASE_INPUT, adults: 2, children: 2 })
      const withoutChildren = calc.calculate({ ...BASE_INPUT, adults: 2, children: 0 })
      expect(withChildren.touristTax).toBeGreaterThan(withoutChildren.touristTax)
    })
  })

  describe('total price', () => {
    it('sums all components correctly', () => {
      const result = calc.calculate({
        ...BASE_INPUT,
        hasLinens: true,   // +50
        hasCleaning: true, // +80
        adults: 2,
        children: 0,
        // base=700, discount=0, linen=50, cleaning=80, insurance=0, tax=2*7*1.5=21
      })
      expect(result.totalPrice).toBe(851) // 700 + 50 + 80 + 0 + 0 + 21
    })

    it('rounds all values to 2 decimal places', () => {
      const result = calc.calculate({
        ...BASE_INPUT,
        discount: 33,
        discountType: 'percent', // 33% of 700 = 231.00 → net = 469
        hasCancellationInsurance: true,
        insuranceRate: 3, // 3% of 469 = 14.07
      })
      const values = Object.values(result)
      values.forEach((v) => {
        const decimals = (v.toString().split('.')[1] ?? '').length
        expect(decimals).toBeLessThanOrEqual(2)
      })
    })
  })
})
