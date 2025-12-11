import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import ReactPDF from '@react-pdf/renderer'
import { InvoicePDF } from '@/features/invoices/components/InvoicePDF'

export async function GET(
  request: NextRequest,
  context: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  try {
    let id: string | undefined
    if ('then' in context.params) {
      // params is a Promise (Next.js 14+)
      const resolved = await context.params
      id = resolved.id
    } else {
      id = context.params.id
    }
    if (!id) {
      return NextResponse.json({ error: 'Missing invoice id' }, { status: 400 })
    }

    // Get invoice with all relations
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

    // Get settings
    const settings = await prisma.settings.findFirst()
    if (!settings) {
      return NextResponse.json({ error: 'Settings not found' }, { status: 500 })
    }

    // Generate PDF
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
          description: invoice.booking.property.description || undefined,
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
          companyPhoneNumber: settings.companyPhoneNumber || undefined,
          companyEmail: settings.companyEmail || undefined,
          currencySymbol: settings.currencySymbol,
          invoicePaymentInstructions: settings.invoicePaymentInstructions || undefined,
          cancellationInsuranceProviderName: settings.cancellationInsuranceProviderName,
        }}
      />
    );

    // Convert stream to buffer
    const chunks: Buffer[] = []
    for await (const chunk of pdfStream) {
      // chunk peut être string ou Buffer, on force Buffer
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    }
    const buffer = Buffer.concat(chunks)

    // Return PDF with proper headers
    const fileName = `Facture-${invoice.invoiceNumber}-${invoice.booking.client.lastName}.pdf`
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
