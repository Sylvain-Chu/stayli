import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET() {
  try {
    await requireAuth()

    const now = new Date()

    const [allInvoices, paidInvoices, overdueInvoices] = await Promise.all([
      // Total invoices
      prisma.invoice.findMany({
        select: {
          amount: true,
          status: true,
          dueDate: true,
        },
      }),
      // Paid invoices
      prisma.invoice.findMany({
        where: { status: 'paid' },
        select: { amount: true },
      }),
      // Overdue invoices (unpaid and past due date)
      prisma.invoice.findMany({
        where: {
          status: { in: ['sent', 'draft'] },
          dueDate: { lt: now },
        },
        select: { amount: true },
      }),
    ])

    const total = allInvoices.length
    const paid = paidInvoices.length
    const overdue = overdueInvoices.length

    const totalAmount = allInvoices.reduce((sum, inv) => sum + inv.amount, 0)
    const paidAmount = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0)
    const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + inv.amount, 0)

    return NextResponse.json({
      total,
      paid,
      overdue,
      totalAmount,
      paidAmount,
      overdueAmount,
    })
  } catch (error) {
    console.error('Error fetching invoice stats:', error)
    return NextResponse.json({ error: 'Failed to fetch invoice stats' }, { status: 500 })
  }
}
