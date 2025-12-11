import React from 'react'
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

// Enregistrement des polices (Inter serait l'idéal pour matcher le site, mais Roboto est standard et fiable pour le PDF)
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

// Styles basés sur votre globals.css (Design System "Forest Green & Warm Neutrals")
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Roboto',
    color: '#1a1a1a', // --foreground
    backgroundColor: '#ffffff', // Fond blanc pour le papier (plus propre à l'impression que le #faf9f7 de l'écran)
  },
  // En-tête
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 40,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoBox: {
    width: 30,
    height: 30,
    backgroundColor: '#2d5a47', // --primary
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  logoText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 700,
  },
  brandName: {
    fontSize: 18,
    fontWeight: 700,
    color: '#1a1a1a',
  },
  headerSubText: {
    fontSize: 9,
    color: '#737373', // --muted-foreground
    marginTop: 2,
  },

  // Titre Facture
  invoiceTitleBlock: {
    alignItems: 'flex-end',
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: '#1a1a1a',
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  invoiceId: {
    fontSize: 11,
    color: '#2d5a47', // --primary
    fontWeight: 500,
    marginBottom: 10,
  },
  dateRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  dateLabel: {
    fontSize: 9,
    color: '#737373',
    width: 60,
  },
  dateValue: {
    fontSize: 9,
    color: '#1a1a1a',
    fontWeight: 500,
  },

  // Adresses (Grid)
  addressContainer: {
    flexDirection: 'row',
    marginBottom: 40,
    gap: 40,
  },
  addressBlock: {
    width: '45%',
  },
  addressLabel: {
    fontSize: 8,
    color: '#737373', // --muted-foreground
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  addressTextMain: {
    fontSize: 10,
    fontWeight: 700,
    color: '#1a1a1a',
    marginBottom: 2,
  },
  addressText: {
    fontSize: 10,
    color: '#4a4a4a', // --secondary-foreground
    lineHeight: 1.4,
  },

  // Tableau
  tableContainer: {
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e8e6e3', // --border
    overflow: 'hidden',
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f3f0', // --secondary / --muted
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e6e3',
  },
  tableHeaderCell: {
    fontSize: 9,
    fontWeight: 500,
    color: '#1a1a1a',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e6e3', // --border
  },
  // Colonnes
  colDesc: { width: '55%' },
  colQty: { width: '10%', textAlign: 'center' },
  colPrice: { width: '15%', textAlign: 'right' },
  colTotal: { width: '20%', textAlign: 'right' },

  cellText: { fontSize: 10, color: '#1a1a1a' },
  cellTextMuted: { fontSize: 10, color: '#737373' },
  cellTextBold: { fontSize: 10, fontWeight: 700, color: '#1a1a1a' },

  // Totaux
  totalsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 40,
  },
  totalsBox: {
    width: 200,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  totalLabel: {
    fontSize: 10,
    color: '#737373',
  },
  totalValue: {
    fontSize: 10,
    color: '#1a1a1a',
    fontWeight: 500,
  },
  separator: {
    height: 1,
    backgroundColor: '#e8e6e3',
    marginVertical: 8,
  },
  finalTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  finalTotalLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: '#1a1a1a',
  },
  finalTotalValue: {
    fontSize: 14,
    fontWeight: 700,
    color: '#2d5a47', // --primary
  },

  // Pied de page
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#e8e6e3',
    paddingTop: 20,
  },
  footerText: {
    fontSize: 8,
    color: '#737373',
    textAlign: 'center',
    lineHeight: 1.5,
  },
  notesBox: {
    backgroundColor: '#faf9f7', // --background (warm)
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e8e6e3',
    marginBottom: 20,
  },
  notesLabel: {
    fontSize: 9,
    fontWeight: 700,
    color: '#2d5a47',
    marginBottom: 4,
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
  const currency = settings.currencySymbol || '€'

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} ${currency}`
  }

  const formatDate = (date: string | Date) => {
    const parsedDate = typeof date === 'string' ? new Date(date) : date
    return format(parsedDate, 'dd MMM yyyy', { locale: fr })
  }

  // Calculs
  const calculateNights = () => {
    const start = new Date(booking.startDate)
    const end = new Date(booking.endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const nights = calculateNights()
  const subtotal = booking.basePrice || 0
  const cleaningFee = booking.cleaningPrice || booking.cleaningFee || 0
  const linensFee = booking.linensPrice || 0
  const insuranceFee = booking.insuranceFee || 0
  const taxes = booking.taxes || 0
  const discount = booking.discount || 0
  const total = booking.totalPrice

  const logoInitial = settings.companyName ? settings.companyName[0].toUpperCase() : 'S'

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.headerContainer}>
          <View>
            <View style={styles.logoContainer}>
              <View style={styles.logoBox}>
                <Text style={styles.logoText}>{logoInitial}</Text>
              </View>
              <Text style={styles.brandName}>{settings.companyName || 'Stayli'}</Text>
            </View>
            <Text style={styles.headerSubText}>{settings.companyAddress}</Text>
            <Text style={styles.headerSubText}>{settings.companyEmail}</Text>
          </View>

          <View style={styles.invoiceTitleBlock}>
            <Text style={styles.invoiceTitle}>FACTURE</Text>
            <Text style={styles.invoiceId}>{invoice.invoiceNumber}</Text>
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Date :</Text>
              <Text style={styles.dateValue}>{formatDate(invoice.issueDate)}</Text>
            </View>
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Échéance :</Text>
              <Text style={styles.dateValue}>{formatDate(invoice.dueDate)}</Text>
            </View>
          </View>
        </View>

        {/* ADDRESSES */}
        <View style={styles.addressContainer}>
          <View style={styles.addressBlock}>
            <Text style={styles.addressLabel}>Émetteur</Text>
            <Text style={styles.addressTextMain}>{property.name}</Text>
            <Text style={styles.addressText}>{property.address}</Text>
          </View>

          <View style={styles.addressBlock}>
            <Text style={styles.addressLabel}>Facturé à</Text>
            <Text style={styles.addressTextMain}>
              {client.firstName} {client.lastName}
            </Text>
            <Text style={styles.addressText}>{client.address}</Text>
            <Text style={styles.addressText}>
              {client.zipCode} {client.city}
            </Text>
            <Text style={styles.addressText}>{client.email}</Text>
          </View>
        </View>

        {/* TABLE */}
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colDesc]}>Description</Text>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>Qté</Text>
            <Text style={[styles.tableHeaderCell, styles.colPrice]}>Prix unit.</Text>
            <Text style={[styles.tableHeaderCell, styles.colTotal]}>Total</Text>
          </View>

          <View style={styles.tableRow}>
            <View style={styles.colDesc}>
              <Text style={styles.cellText}>Séjour - {property.name}</Text>
              <Text style={[styles.cellTextMuted, { fontSize: 8, marginTop: 2 }]}>
                Du {formatDate(booking.startDate)} au {formatDate(booking.endDate)}
              </Text>
            </View>
            <Text style={[styles.cellTextMuted, styles.colQty]}>{nights}</Text>
            <Text style={[styles.cellTextMuted, styles.colPrice]}>
              {formatCurrency(subtotal / nights)}
            </Text>
            <Text style={[styles.cellTextBold, styles.colTotal]}>{formatCurrency(subtotal)}</Text>
          </View>

          {booking.hasCleaning && cleaningFee > 0 && (
            <View style={styles.tableRow}>
              <Text style={[styles.cellText, styles.colDesc]}>Ménage fin de séjour</Text>
              <Text style={[styles.cellTextMuted, styles.colQty]}>1</Text>
              <Text style={[styles.cellTextMuted, styles.colPrice]}>
                {formatCurrency(cleaningFee)}
              </Text>
              <Text style={[styles.cellTextBold, styles.colTotal]}>
                {formatCurrency(cleaningFee)}
              </Text>
            </View>
          )}

          {booking.hasLinens && linensFee > 0 && (
            <View style={styles.tableRow}>
              <Text style={[styles.cellText, styles.colDesc]}>Linge de maison</Text>
              <Text style={[styles.cellTextMuted, styles.colQty]}>1</Text>
              <Text style={[styles.cellTextMuted, styles.colPrice]}>
                {formatCurrency(linensFee)}
              </Text>
              <Text style={[styles.cellTextBold, styles.colTotal]}>
                {formatCurrency(linensFee)}
              </Text>
            </View>
          )}

          {booking.hasCancellationInsurance && insuranceFee > 0 && (
            <View style={styles.tableRow}>
              <Text style={[styles.cellText, styles.colDesc]}>
                Assurance annulation ({settings.cancellationInsuranceProviderName || 'Inclus'})
              </Text>
              <Text style={[styles.cellTextMuted, styles.colQty]}>1</Text>
              <Text style={[styles.cellTextMuted, styles.colPrice]}>
                {formatCurrency(insuranceFee)}
              </Text>
              <Text style={[styles.cellTextBold, styles.colTotal]}>
                {formatCurrency(insuranceFee)}
              </Text>
            </View>
          )}

          {taxes > 0 && (
            <View style={styles.tableRow}>
              <Text style={[styles.cellText, styles.colDesc]}>Taxe de séjour</Text>
              <Text style={[styles.cellTextMuted, styles.colQty]}>-</Text>
              <Text style={[styles.cellTextMuted, styles.colPrice]}>-</Text>
              <Text style={[styles.cellTextBold, styles.colTotal]}>{formatCurrency(taxes)}</Text>
            </View>
          )}

          {discount > 0 && (
            <View style={styles.tableRow}>
              <Text style={[styles.cellText, styles.colDesc]}>
                Remise {booking.discountType ? `(${booking.discountType})` : ''}
              </Text>
              <Text style={[styles.cellTextMuted, styles.colQty]}>1</Text>
              <Text style={[styles.cellTextMuted, styles.colPrice]}>
                -{formatCurrency(discount)}
              </Text>
              <Text style={[styles.cellTextBold, styles.colTotal, { color: '#2d5a47' }]}>
                -{formatCurrency(discount)}
              </Text>
            </View>
          )}
        </View>

        {/* TOTALS */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Sous-total</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(subtotal + cleaningFee + linensFee + insuranceFee)}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Taxes (0%)</Text>
              <Text style={styles.totalValue}>{formatCurrency(taxes)}</Text>
            </View>

            <View style={styles.separator} />

            <View style={styles.finalTotalRow}>
              <Text style={styles.finalTotalLabel}>Total TTC</Text>
              <Text style={styles.finalTotalValue}>{formatCurrency(total)}</Text>
            </View>
          </View>
        </View>

        {/* NOTES / INSTRUCTIONS */}
        {(settings.invoicePaymentInstructions || booking.specialRequests) && (
          <View style={styles.notesBox}>
            {settings.invoicePaymentInstructions && (
              <View style={{ marginBottom: 10 }}>
                <Text style={styles.notesLabel}>Instructions de paiement</Text>
                <Text style={styles.addressText}>{settings.invoicePaymentInstructions}</Text>
              </View>
            )}

            {booking.specialRequests && (
              <View>
                <Text style={styles.notesLabel}>Notes</Text>
                <Text style={styles.addressText}>{booking.specialRequests}</Text>
              </View>
            )}
          </View>
        )}

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Merci de votre confiance. En cas de retard de paiement, des pénalités pourront être
            appliquées conformément à la législation en vigueur.
          </Text>
        </View>
      </Page>
    </Document>
  )
}
