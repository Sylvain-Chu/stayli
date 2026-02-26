import { describe, it, expect } from 'vitest'
import {
  createBookingSchema,
  updateBookingSchema,
  calculatePriceSchema,
  checkAvailabilitySchema,
} from '../booking'

const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000'
const VALID_DATE_START = '2025-07-01T00:00:00.000Z'
const VALID_DATE_END = '2025-07-08T00:00:00.000Z'

describe('createBookingSchema', () => {
  const validData = {
    startDate: VALID_DATE_START,
    endDate: VALID_DATE_END,
    propertyId: VALID_UUID,
    clientId: VALID_UUID,
    adults: 2,
    children: 0,
    basePrice: 700,
    totalPrice: 770,
  }

  it('accepts valid booking data', () => {
    expect(createBookingSchema.safeParse(validData).success).toBe(true)
  })

  it('rejects when endDate is before startDate', () => {
    const result = createBookingSchema.safeParse({
      ...validData,
      endDate: '2025-06-30T00:00:00.000Z',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].path).toContain('endDate')
    }
  })

  it('rejects when endDate equals startDate', () => {
    const result = createBookingSchema.safeParse({
      ...validData,
      endDate: VALID_DATE_START,
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid propertyId UUID', () => {
    const result = createBookingSchema.safeParse({ ...validData, propertyId: 'not-a-uuid' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid clientId UUID', () => {
    const result = createBookingSchema.safeParse({ ...validData, clientId: 'not-a-uuid' })
    expect(result.success).toBe(false)
  })

  it('rejects adults < 1', () => {
    const result = createBookingSchema.safeParse({ ...validData, adults: 0 })
    expect(result.success).toBe(false)
  })

  it('rejects negative basePrice', () => {
    const result = createBookingSchema.safeParse({ ...validData, basePrice: -1 })
    expect(result.success).toBe(false)
  })

  it('defaults status to confirmed', () => {
    const result = createBookingSchema.safeParse(validData)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.status).toBe('confirmed')
    }
  })

  it('accepts valid discountType values', () => {
    for (const type of ['amount', 'percent']) {
      const result = createBookingSchema.safeParse({ ...validData, discountType: type })
      expect(result.success).toBe(true)
    }
  })
})

describe('updateBookingSchema', () => {
  it('accepts partial data (all fields optional)', () => {
    expect(updateBookingSchema.safeParse({ adults: 3 }).success).toBe(true)
    expect(updateBookingSchema.safeParse({}).success).toBe(true)
  })

  it('rejects when both dates provided and end is before start', () => {
    const result = updateBookingSchema.safeParse({
      startDate: VALID_DATE_END,
      endDate: VALID_DATE_START,
    })
    expect(result.success).toBe(false)
  })

  it('accepts single date without the other', () => {
    expect(updateBookingSchema.safeParse({ startDate: VALID_DATE_START }).success).toBe(true)
    expect(updateBookingSchema.safeParse({ endDate: VALID_DATE_END }).success).toBe(true)
  })
})

describe('calculatePriceSchema', () => {
  const validData = {
    startDate: VALID_DATE_START,
    endDate: VALID_DATE_END,
    adults: 2,
    children: 0,
  }

  it('accepts valid data', () => {
    expect(calculatePriceSchema.safeParse(validData).success).toBe(true)
  })

  it('rejects when endDate <= startDate', () => {
    const result = calculatePriceSchema.safeParse({
      ...validData,
      endDate: VALID_DATE_START,
    })
    expect(result.success).toBe(false)
  })

  it('defaults booleans to false', () => {
    const result = calculatePriceSchema.safeParse(validData)
    if (result.success) {
      expect(result.data.hasLinens).toBe(false)
      expect(result.data.hasCleaning).toBe(false)
      expect(result.data.hasCancellationInsurance).toBe(false)
    }
  })
})

describe('checkAvailabilitySchema', () => {
  const validData = {
    propertyId: VALID_UUID,
    startDate: VALID_DATE_START,
    endDate: VALID_DATE_END,
  }

  it('accepts valid data', () => {
    expect(checkAvailabilitySchema.safeParse(validData).success).toBe(true)
  })

  it('accepts optional excludeBookingId and clientId', () => {
    const result = checkAvailabilitySchema.safeParse({
      ...validData,
      excludeBookingId: VALID_UUID,
      clientId: VALID_UUID,
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid propertyId', () => {
    const result = checkAvailabilitySchema.safeParse({ ...validData, propertyId: 'bad' })
    expect(result.success).toBe(false)
  })
})
