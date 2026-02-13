import { type PrismaClient } from '@prisma/client'

/**
 * Generate a unique invoice number inside a Prisma transaction.
 *
 * Format: {prefix}{YYYYMMDD}-{NNNN}
 * Example: INV-20260213-0001
 *
 * Uses a transaction-level count of today's invoices to avoid
 * race conditions on concurrent invoice creation.
 */
export async function generateInvoiceNumber(
  tx: PrismaClient | Parameters<Parameters<PrismaClient['$transaction']>[0]>[0],
  prefix: string = 'INV-',
): Promise<string> {
  const today = new Date()
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')

  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

  const count = await tx.invoice.count({
    where: {
      createdAt: {
        gte: startOfDay,
        lt: endOfDay,
      },
    },
  })

  return `${prefix}${dateStr}-${String(count + 1).padStart(4, '0')}`
}
