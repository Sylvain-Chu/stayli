import { describe, it, expect } from 'vitest'
import { clientSchema } from '../client'

describe('clientSchema', () => {
  it('should validate correct client data', () => {
    const validData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '123456789',
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
})
