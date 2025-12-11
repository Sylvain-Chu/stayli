import React from 'react'
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

// Register fonts for better rendering
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf',
      fontWeight: 300,
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf',
      fontWeight: 500,
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',
      fontWeight: 700,
    },
  ],
})

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Roboto',
    color: '#333',
  },
  header: {
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
  },
  companyInfo: {
    marginBottom: 10,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 700,
    color: '#2563eb',
    marginBottom: 5,
  },
  companyDetails: {
    fontSize: 9,
    color: '#666',
    marginBottom: 2,
  },
  invoiceTitle: {
    fontSize: 28,
    fontWeight: 700,
    color: '#1e40af',
    marginTop: 20,
    marginBottom: 5,
  },
  invoiceNumber: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  section: {
    width: '48%',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: '#2563eb',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  text: {
    fontSize: 10,
    marginBottom: 4,
    lineHeight: 1.4,
  },
  textBold: {
    fontWeight: 700,
  },
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#2563eb',
    color: '#fff',
    padding: 10,
    fontWeight: 700,
    fontSize: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    padding: 10,
    fontSize: 9,
  },
  tableRowAlt: {
    backgroundColor: '#f9fafb',
  },
  col1: {
    width: '50%',
  },
  col2: {
    width: '15%',
    textAlign: 'center',
  },
  col3: {
    width: '18%',
    textAlign: 'right',
  },
  col4: {
    width: '17%',
    textAlign: 'right',
  },
  totalSection: {
    marginLeft: 'auto',
    width: '40%',
    marginTop: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    fontSize: 10,
  },
  totalRowFinal: {
    backgroundColor: '#2563eb',
    color: '#fff',
    fontWeight: 700,
    fontSize: 12,
    padding: 12,
    marginTop: 5,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  paymentInstructions: {
    fontSize: 9,
    color: '#666',
    marginBottom: 15,
  },
  footerTitle: {
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 5,
  },
  notes: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f9fafb',
    borderRadius: 5,
    fontSize: 9,
    color: '#666',
    lineHeight: 1.5,
  },
})

interface InvoicePDFProps {
  invoice: {
    invoiceNumber: string
    issueDate: string | Date
    dueDate: string | Date
    amount: number
    status: string
  }
  booking: {
    id: string
    startDate: string | Date
    endDate: string | Date
    totalPrice: number
    basePrice: number
    cleaningFee?: number
    taxes?: number
    adults: number
    children: number
    discount?: number
    discountType?: string
    hasLinens?: boolean
    linensPrice?: number
    hasCleaning?: boolean
    cleaningPrice?: number
    hasCancellationInsurance?: boolean
    insuranceFee?: number
    specialRequests?: string
  }
  property: {
    name: string
    address?: string
    description?: string
  }
  client: {
    firstName: string
    lastName: string
    email: string
    phone?: string
    address?: string
    zipCode?: string
    city?: string
  }
  settings: {
    companyName?: string
    companyAddress?: string
    companyPhoneNumber?: string
    companyEmail?: string
    currencySymbol?: string
    invoicePaymentInstructions?: string
    cancellationInsuranceProviderName?: string
  }
}

export const InvoicePDF: React.FC<InvoicePDFProps> = ({
  invoice,
  booking,
  property,
  client,
  settings,
}) => {
  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} ${settings.currencySymbol || '€'}`
  }

  const formatDate = (date: string | Date) => {
    const parsedDate = typeof date === 'string' ? new Date(date) : date
    return format(parsedDate, 'dd MMMM yyyy', { locale: fr })
  }

  const calculateNights = () => {
    const start = new Date(booking.startDate)
    const end = new Date(booking.endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const nights = calculateNights()
  const subtotal = booking.basePrice || 0
  const cleaningFee = booking.cleaningPrice || booking.cleaningFee || 0
  const linensFee = booking.linensPrice || 0
  const insuranceFee = booking.insuranceFee || 0
  const taxes = booking.taxes || 0
  const discount = booking.discount || 0
  const total = booking.totalPrice

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{settings.companyName || 'Vacation Rentals'}</Text>
            {settings.companyAddress && (
              <Text style={styles.companyDetails}>{settings.companyAddress}</Text>
            )}
            {settings.companyPhoneNumber && (
              <Text style={styles.companyDetails}>Tél: {settings.companyPhoneNumber}</Text>
            )}
            {settings.companyEmail && (
              <Text style={styles.companyDetails}>Email: {settings.companyEmail}</Text>
            )}
          </View>

          <Text style={styles.invoiceTitle}>FACTURE</Text>
          <Text style={styles.invoiceNumber}>N° {invoice.invoiceNumber}</Text>
          <Text style={styles.invoiceNumber}>Date d'émission: {formatDate(invoice.issueDate)}</Text>
          <Text style={styles.invoiceNumber}>Date d'échéance: {formatDate(invoice.dueDate)}</Text>
        </View>

        {/* Client and Booking Info */}
        <View style={styles.sectionRow}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Facturé à</Text>
            <Text style={[styles.text, styles.textBold]}>
              {client.firstName} {client.lastName}
            </Text>
            {client.address && <Text style={styles.text}>{client.address}</Text>}
            {(client.zipCode || client.city) && (
              <Text style={styles.text}>
                {client.zipCode} {client.city}
              </Text>
            )}
            {client.email && <Text style={styles.text}>Email: {client.email}</Text>}
            {client.phone && <Text style={styles.text}>Tél: {client.phone}</Text>}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Détails de la réservation</Text>
            <Text style={[styles.text, styles.textBold]}>{property.name}</Text>
            {property.address && <Text style={styles.text}>{property.address}</Text>}
            <Text style={styles.text}>
              Du {formatDate(booking.startDate)} au {formatDate(booking.endDate)}
            </Text>
            <Text style={styles.text}>
              {nights} nuit{nights > 1 ? 's' : ''}
            </Text>
            <Text style={styles.text}>
              {booking.adults} adulte{booking.adults > 1 ? 's' : ''}
              {booking.children > 0 &&
                `, ${booking.children} enfant${booking.children > 1 ? 's' : ''}`}
            </Text>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Description</Text>
            <Text style={styles.col2}>Quantité</Text>
            <Text style={styles.col3}>Prix unitaire</Text>
            <Text style={styles.col4}>Total</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.col1}>Location - {property.name}</Text>
            <Text style={styles.col2}>
              {nights} nuit{nights > 1 ? 's' : ''}
            </Text>
            <Text style={styles.col3}>{formatCurrency(subtotal / nights)}</Text>
            <Text style={styles.col4}>{formatCurrency(subtotal)}</Text>
          </View>

          {booking.hasCleaning && cleaningFee > 0 && (
            <View style={[styles.tableRow, styles.tableRowAlt]}>
              <Text style={styles.col1}>Frais de ménage</Text>
              <Text style={styles.col2}>1</Text>
              <Text style={styles.col3}>{formatCurrency(cleaningFee)}</Text>
              <Text style={styles.col4}>{formatCurrency(cleaningFee)}</Text>
            </View>
          )}

          {booking.hasLinens && linensFee > 0 && (
            <View style={styles.tableRow}>
              <Text style={styles.col1}>Linge de maison</Text>
              <Text style={styles.col2}>1</Text>
              <Text style={styles.col3}>{formatCurrency(linensFee)}</Text>
              <Text style={styles.col4}>{formatCurrency(linensFee)}</Text>
            </View>
          )}

          {booking.hasCancellationInsurance && insuranceFee > 0 && (
            <View style={[styles.tableRow, styles.tableRowAlt]}>
              <Text style={styles.col1}>
                Assurance annulation -{' '}
                {settings.cancellationInsuranceProviderName || 'Holiday Peace of Mind Insurance'}
              </Text>
              <Text style={styles.col2}>1</Text>
              <Text style={styles.col3}>{formatCurrency(insuranceFee)}</Text>
              <Text style={styles.col4}>{formatCurrency(insuranceFee)}</Text>
            </View>
          )}

          {taxes > 0 && (
            <View style={styles.tableRow}>
              <Text style={styles.col1}>Taxes de séjour</Text>
              <Text style={styles.col2}>-</Text>
              <Text style={styles.col3}>-</Text>
              <Text style={styles.col4}>{formatCurrency(taxes)}</Text>
            </View>
          )}

          {discount > 0 && (
            <View style={[styles.tableRow, styles.tableRowAlt]}>
              <Text style={styles.col1}>
                Réduction{booking.discountType ? ` (${booking.discountType})` : ''}
              </Text>
              <Text style={styles.col2}>-</Text>
              <Text style={styles.col3}>-</Text>
              <Text style={styles.col4}>-{formatCurrency(discount)}</Text>
            </View>
          )}
        </View>

        {/* Total */}
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text>Sous-total:</Text>
            <Text>{formatCurrency(subtotal + cleaningFee + linensFee + insuranceFee)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Taxes:</Text>
            <Text>{formatCurrency(taxes)}</Text>
          </View>
          {discount > 0 && (
            <View style={styles.totalRow}>
              <Text>Réduction:</Text>
              <Text>-{formatCurrency(discount)}</Text>
            </View>
          )}
          <View style={[styles.totalRow, styles.totalRowFinal]}>
            <Text>TOTAL:</Text>
            <Text>{formatCurrency(total)}</Text>
          </View>
        </View>

        {/* Payment Instructions */}
        <View style={styles.footer}>
          {settings.invoicePaymentInstructions && (
            <>
              <Text style={styles.footerTitle}>Instructions de paiement</Text>
              <Text style={styles.paymentInstructions}>{settings.invoicePaymentInstructions}</Text>
            </>
          )}

          {booking.specialRequests && (
            <View style={styles.notes}>
              <Text style={styles.footerTitle}>Notes et demandes spéciales:</Text>
              <Text>{booking.specialRequests}</Text>
            </View>
          )}

          <Text style={[styles.paymentInstructions, { marginTop: 15, textAlign: 'center' }]}>
            Merci pour votre confiance !
          </Text>
        </View>
      </Page>
    </Document>
  )
}
