import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import ReactPDF from '@react-pdf/renderer'
import { InvoicePDF } from '@/features/invoices/components/InvoicePDF'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth()

    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'Missing invoice id' }, { status: 400 })
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            client: true,
            property: true,
          },
        },
      },
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    const settings = await prisma.settings.findFirst()
    if (!settings) {
      return NextResponse.json({ error: 'Settings not found' }, { status: 500 })
    }

    // Le JSX ci-dessous nécessite l'extension .tsx
    const pdfStream = await ReactPDF.renderToStream(
      <InvoicePDF
        invoice={{
          invoiceNumber: invoice.invoiceNumber,
          issueDate: invoice.issueDate,
          dueDate: invoice.dueDate,
          amount: invoice.amount,
          status: invoice.status,
        }}
        booking={{
          id: invoice.booking.id,
          startDate: invoice.booking.startDate,
          endDate: invoice.booking.endDate,
          totalPrice: invoice.booking.totalPrice,
          basePrice: invoice.booking.basePrice,
          cleaningFee: invoice.booking.cleaningFee,
          taxes: invoice.booking.taxes,
          adults: invoice.booking.adults,
          children: invoice.booking.children,
          discount: invoice.booking.discount,
          discountType: invoice.booking.discountType || undefined,
          hasLinens: invoice.booking.hasLinens,
          linensPrice: invoice.booking.linensPrice,
          hasCleaning: invoice.booking.hasCleaning,
          cleaningPrice: invoice.booking.cleaningPrice,
          hasCancellationInsurance: invoice.booking.hasCancellationInsurance,
          insuranceFee: invoice.booking.insuranceFee,
          specialRequests: invoice.booking.specialRequests || undefined,
        }}
        property={{
          name: invoice.booking.property.name,
          address: invoice.booking.property.address || undefined,
        }}
        client={{
          firstName: invoice.booking.client.firstName,
          lastName: invoice.booking.client.lastName,
          email: invoice.booking.client.email,
          phone: invoice.booking.client.phone || undefined,
          address: invoice.booking.client.address || undefined,
          zipCode: invoice.booking.client.zipCode || undefined,
          city: invoice.booking.client.city || undefined,
        }}
        settings={{
          companyName: settings.companyName || undefined,
          companyAddress: settings.companyAddress || undefined,
          companyZipCode: settings.companyZipCode || undefined,
          companyCity: settings.companyCity || undefined,
          companyPhoneNumber: settings.companyPhoneNumber || undefined,
          companyEmail: settings.companyEmail || undefined,
          companyLogoUrl: settings.companyLogoUrl || undefined,
          companySiret: settings.companySiret || undefined,
          currencySymbol: settings.currencySymbol,
          invoicePaymentInstructions: settings.invoicePaymentInstructions || undefined,
          cancellationInsuranceProviderName: settings.cancellationInsuranceProviderName,
          touristTaxRatePerPersonPerDay: settings.touristTaxRatePerPersonPerDay,
        }}
      />,
    )

    const chunks: Buffer[] = []
    for await (const chunk of pdfStream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    }
    const buffer = Buffer.concat(chunks)

    const safeInvoiceNumber = invoice.invoiceNumber.replace(/[^a-zA-Z0-9-_]/g, '')
    const fileName = `${safeInvoiceNumber}_${invoice.booking.client.lastName}.pdf`

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}
