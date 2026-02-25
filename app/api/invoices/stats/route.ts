import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleApiError, successResponse } from '@/lib/api-error'

export async function GET() {
  try {
    await requireAuth()

    const now = new Date()

    const [allStats, paidStats, overdueStats] = await Promise.all([
      // Total invoices
      prisma.invoice.aggregate({
        _count: true,
        _sum: { amount: true },
      }),
      // Paid invoices
      prisma.invoice.aggregate({
        where: { status: 'paid' },
        _count: true,
        _sum: { amount: true },
      }),
      // Overdue invoices (unpaid and past due date)
      prisma.invoice.aggregate({
        where: {
          status: { in: ['sent', 'draft'] },
          dueDate: { lt: now },
        },
        _count: true,
        _sum: { amount: true },
      }),
    ])

    const total = allStats._count
    const paid = paidStats._count
    const overdue = overdueStats._count

    const totalAmount = allStats._sum.amount ?? 0
    const paidAmount = paidStats._sum.amount ?? 0
    const overdueAmount = overdueStats._sum.amount ?? 0

    return successResponse({
      total,
      paid,
      overdue,
      totalAmount,
      paidAmount,
      overdueAmount,
    })
  } catch (error) {
    return handleApiError(error, 'Failed to fetch invoice stats')
  }
}
