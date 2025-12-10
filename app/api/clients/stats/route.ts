import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

    const total = await prisma.client.count()

    const newThisMonth = await prisma.client.count({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
      },
    })

    const newLastMonth = await prisma.client.count({
      where: {
        createdAt: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
      },
    })

    let growthPercentage = 0
    if (newLastMonth > 0) {
      growthPercentage = ((newThisMonth - newLastMonth) / newLastMonth) * 100
    } else if (newThisMonth > 0) {
      growthPercentage = 100
    }

    const activeThisMonth = await prisma.client.count({
      where: {
        bookings: {
          some: {
            OR: [
              {
                startDate: {
                  gte: startOfMonth,
                  lt: new Date(now.getFullYear(), now.getMonth() + 1, 1),
                },
              },
              {
                endDate: {
                  gte: startOfMonth,
                  lt: new Date(now.getFullYear(), now.getMonth() + 1, 1),
                },
              },
              {
                AND: [
                  { startDate: { lt: startOfMonth } },
                  { endDate: { gte: new Date(now.getFullYear(), now.getMonth() + 1, 1) } },
                ],
              },
            ],
          },
        },
      },
    })

    return NextResponse.json({
      total,
      newThisMonth,
      growthPercentage: Math.round(growthPercentage * 10) / 10,
      activeThisMonth,
    })
  } catch (error) {
    console.error('Error fetching client stats:', error)
    return NextResponse.json({ error: 'Failed to fetch client statistics' }, { status: 500 })
  }
}
