import { describe, it, expect } from 'vitest'
import { propertySchema, updatePropertySchema } from '../property'

describe('propertySchema', () => {
  it('accepts valid property data', () => {
    const result = propertySchema.safeParse({ name: 'Villa Azur' })
    expect(result.success).toBe(true)
  })

  it('accepts all optional fields', () => {
    const result = propertySchema.safeParse({
      name: 'Villa Azur',
      address: '12 rue de la Plage',
      description: 'Belle villa avec piscine',
      contractDescription: 'Contrat standard',
    })
    expect(result.success).toBe(true)
  })

  it('accepts empty string for optional fields', () => {
    const result = propertySchema.safeParse({
      name: 'Villa Azur',
      address: '',
      description: '',
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing name', () => {
    const result = propertySchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('rejects empty name', () => {
    const result = propertySchema.safeParse({ name: '' })
    expect(result.success).toBe(false)
  })

  it('rejects name longer than 200 characters', () => {
    const result = propertySchema.safeParse({ name: 'A'.repeat(201) })
    expect(result.success).toBe(false)
  })

  it('accepts name at max length (200 chars)', () => {
    const result = propertySchema.safeParse({ name: 'A'.repeat(200) })
    expect(result.success).toBe(true)
  })
})

describe('updatePropertySchema', () => {
  it('accepts partial data', () => {
    expect(updatePropertySchema.safeParse({ name: 'New Name' }).success).toBe(true)
    expect(updatePropertySchema.safeParse({ description: 'New desc' }).success).toBe(true)
    expect(updatePropertySchema.safeParse({}).success).toBe(true)
  })

  it('still rejects invalid name when provided', () => {
    const result = updatePropertySchema.safeParse({ name: '' })
    expect(result.success).toBe(false)
  })
})
