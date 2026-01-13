import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    })

    return NextResponse.json(clients)
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 })
  }
}
