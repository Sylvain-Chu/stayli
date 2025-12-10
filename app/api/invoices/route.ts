import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { invoiceSchema } from '@/lib/validations/invoice'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const perPage = parseInt(searchParams.get('perPage') || '10')

    const where = search
      ? {
          OR: [
            { invoiceNumber: { contains: search, mode: 'insensitive' as const } },
            {
              booking: {
                client: {
                  OR: [
                    { firstName: { contains: search, mode: 'insensitive' as const } },
                    { lastName: { contains: search, mode: 'insensitive' as const } },
                    { email: { contains: search, mode: 'insensitive' as const } },
                  ],
                },
              },
            },
          ],
        }
      : {}

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip: (page - 1) * perPage,
        take: perPage,
        include: {
          booking: {
            include: {
              client: true,
              property: true,
            },
          },
        },
        orderBy: { issueDate: 'desc' },
      }),
      prisma.invoice.count({ where }),
    ])

    return NextResponse.json({
      invoices,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    })
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = invoiceSchema.parse(body)

    // Générer le numéro de facture
    const today = new Date()
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')
    const count = await prisma.invoice.count({
      where: {
        issueDate: {
          gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
          lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
        },
      },
    })
    const invoiceNumber = `INV-${dateStr}-${String(count + 1).padStart(4, '0')}`

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        issueDate: validatedData.issueDate ? new Date(validatedData.issueDate) : new Date(),
        dueDate: new Date(validatedData.dueDate),
        amount: validatedData.amount,
        status: validatedData.status || 'draft',
        bookingId: validatedData.bookingId,
      },
      include: {
        booking: {
          include: {
            client: true,
            property: true,
          },
        },
      },
    })

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 })
  }
}
