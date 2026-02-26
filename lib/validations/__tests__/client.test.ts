import { describe, it, expect } from 'vitest'
import { clientSchema } from '../client'

describe('clientSchema', () => {
  it('should validate correct client data', () => {
    const validData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '06 12 34 56 78',
    }

    const result = clientSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('should reject missing required fields', () => {
    const invalidData = {
      firstName: '',
      lastName: 'Doe',
      email: 'john@example.com',
    }

    const result = clientSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should reject invalid email', () => {
    const invalidData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'not-an-email',
    }

    const result = clientSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should accept optional phone', () => {
    const validData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    }

    const result = clientSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('should reject too long names', () => {
    const invalidData = {
      firstName: 'A'.repeat(101),
      lastName: 'Doe',
      email: 'john@example.com',
    }

    const result = clientSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should reject invalid zip code', () => {
    const result = clientSchema.safeParse({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      zipCode: '1234',
    })
    expect(result.success).toBe(false)
  })

  it('should accept valid zip code', () => {
    const result = clientSchema.safeParse({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      zipCode: '75001',
    })
    expect(result.success).toBe(true)
  })
})
