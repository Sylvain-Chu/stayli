import { describe, it, expect } from 'vitest'
import { expenseSchema, updateExpenseSchema } from '../expense'

const validPropertyId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'

describe('expenseSchema', () => {
  it('accepts valid expense data with all fields', () => {
    const result = expenseSchema.safeParse({
      propertyId: validPropertyId,
      amount: 150.5,
      category: 'energy',
      description: 'Facture EDF janvier',
      date: '2026-01-15',
      supplier: 'EDF',
    })
    expect(result.success).toBe(true)
  })

  it('accepts valid expense data with required fields only', () => {
    const result = expenseSchema.safeParse({
      propertyId: validPropertyId,
      amount: 200,
      category: 'materials',
      date: '2026-02-20',
    })
    expect(result.success).toBe(true)
  })

  it('accepts all four expense categories', () => {
    const categories = ['energy', 'materials', 'maintenance', 'insurance'] as const
    categories.forEach((category) => {
      const result = expenseSchema.safeParse({
        propertyId: validPropertyId,
        amount: 100,
        category,
        date: '2026-03-01',
      })
      expect(result.success).toBe(true)
    })
  })

  it('accepts empty string for optional description', () => {
    const result = expenseSchema.safeParse({
      propertyId: validPropertyId,
      amount: 50,
      category: 'insurance',
      description: '',
      date: '2026-03-10',
    })
    expect(result.success).toBe(true)
  })

  it('accepts empty string for optional supplier', () => {
    const result = expenseSchema.safeParse({
      propertyId: validPropertyId,
      amount: 75,
      category: 'maintenance',
      supplier: '',
      date: '2026-03-05',
    })
    expect(result.success).toBe(true)
  })

  it('rejects negative amount', () => {
    const result = expenseSchema.safeParse({
      propertyId: validPropertyId,
      amount: -100,
      category: 'energy',
      date: '2026-03-01',
    })
    expect(result.success).toBe(false)
  })

  it('rejects zero amount', () => {
    const result = expenseSchema.safeParse({
      propertyId: validPropertyId,
      amount: 0,
      category: 'energy',
      date: '2026-03-01',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid category', () => {
    const result = expenseSchema.safeParse({
      propertyId: validPropertyId,
      amount: 100,
      category: 'invalid',
      date: '2026-03-01',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid property ID (non-UUID)', () => {
    const result = expenseSchema.safeParse({
      propertyId: 'not-a-uuid',
      amount: 100,
      category: 'energy',
      date: '2026-03-01',
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing propertyId', () => {
    const result = expenseSchema.safeParse({
      amount: 100,
      category: 'energy',
      date: '2026-03-01',
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing amount', () => {
    const result = expenseSchema.safeParse({
      propertyId: validPropertyId,
      category: 'energy',
      date: '2026-03-01',
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing category', () => {
    const result = expenseSchema.safeParse({
      propertyId: validPropertyId,
      amount: 100,
      date: '2026-03-01',
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing date', () => {
    const result = expenseSchema.safeParse({
      propertyId: validPropertyId,
      amount: 100,
      category: 'energy',
    })
    expect(result.success).toBe(false)
  })
})

describe('updateExpenseSchema', () => {
  it('accepts partial data with single field', () => {
    expect(updateExpenseSchema.safeParse({ amount: 150 }).success).toBe(true)
    expect(updateExpenseSchema.safeParse({ category: 'materials' }).success).toBe(true)
    expect(updateExpenseSchema.safeParse({ description: 'Updated description' }).success).toBe(true)
  })

  it('accepts empty object (no updates)', () => {
    const result = updateExpenseSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('still rejects invalid amount when provided', () => {
    const result = updateExpenseSchema.safeParse({ amount: -50 })
    expect(result.success).toBe(false)
  })

  it('still rejects invalid category when provided', () => {
    const result = updateExpenseSchema.safeParse({ category: 'invalid' })
    expect(result.success).toBe(false)
  })

  it('still rejects invalid property ID when provided', () => {
    const result = updateExpenseSchema.safeParse({ propertyId: 'not-a-uuid' })
    expect(result.success).toBe(false)
  })

  it('accepts multiple valid partial fields', () => {
    const result = updateExpenseSchema.safeParse({
      amount: 200,
      description: 'Updated',
      supplier: 'New Supplier',
    })
    expect(result.success).toBe(true)
  })
})
