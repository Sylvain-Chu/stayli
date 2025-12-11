import React from 'react'
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

// Enregistrement des polices
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

// Design System : Couleurs du site
const colors = {
  primary: '#2d5a47', // Vert forêt
  secondary: '#f5f3f0', // Fond chaud clair
  text: '#1a1a1a',
  textMuted: '#737373',
  border: '#e8e6e3',
  white: '#ffffff',
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Roboto',
    color: colors.text,
    backgroundColor: colors.white,
  },

  // --- HEADER ---
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  brandColumn: {
    width: '50%',
  },
  logoImage: {
    width: 120,
    height: 'auto',
    marginBottom: 10,
  },
  logoPlaceholder: {
    width: 40,
    height: 40,
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  logoInitial: {
    color: colors.white,
    fontSize: 20,
    fontWeight: 700,
  },
  senderName: {
    fontSize: 14,
    fontWeight: 700,
    color: colors.primary,
    marginBottom: 4,
  },
  senderInfo: {
    fontSize: 9,
    color: colors.textMuted,
    lineHeight: 1.4,
  },

  // --- INVOICE DETAILS (Right Header) ---
  invoiceMetaColumn: {
    width: '45%',
    alignItems: 'flex-end',
  },
  invoiceTitle: {
    fontSize: 34,
    fontWeight: 300,
    color: colors.primary,
    textTransform: 'uppercase',
    marginBottom: 15,
    letterSpacing: 2,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginRight: 10,
    textAlign: 'right',
  },
  metaValue: {
    fontSize: 11,
    fontWeight: 700,
    color: colors.text,
    textAlign: 'right',
    minWidth: 80,
  },

  // --- CLIENT INFO ---
  clientSection: {
    backgroundColor: colors.secondary,
    padding: 15,
    borderRadius: 8,
    marginBottom: 30,
    flexDirection: 'row',
  },
  clientLabel: {
    fontSize: 9,
    fontWeight: 700,
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  clientName: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 2,
  },
  clientAddress: {
    fontSize: 10,
    lineHeight: 1.4,
  },

  // --- TABLE ---
  tableContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
    paddingBottom: 8,
    marginBottom: 8,
  },
  headerCell: {
    fontSize: 9,
    fontWeight: 700,
    color: colors.primary,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  // Column Widths - SANS QUANTITÉ
  colDesc: { width: '65%' },
  colPrice: { width: '17.5%', textAlign: 'right' },
  colTotal: { width: '17.5%', textAlign: 'right' },

  cellText: { fontSize: 10 },
  cellMuted: { fontSize: 9, color: colors.textMuted, marginTop: 2 },
  cellBold: { fontSize: 10, fontWeight: 700 },

  // --- TOTALS & PAYMENT ---
  footerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  paymentInfoColumn: {
    width: '55%',
    paddingRight: 20,
  },
  totalsColumn: {
    width: '40%',
  },

  // Payment Details styling
  sectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: colors.primary,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  paymentText: {
    fontSize: 9,
    color: colors.textMuted,
    marginBottom: 2,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    fontSize: 9,
  },

  // Totals Styling
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  totalLabel: {
    fontSize: 10,
    color: colors.textMuted,
  },
  totalValue: {
    fontSize: 10,
    fontWeight: 500,
  },
  finalTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 2,
    borderTopColor: colors.primary,
  },
  finalTotalLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: colors.primary,
  },
  finalTotalValue: {
    fontSize: 14,
    fontWeight: 700,
    color: colors.primary,
  },

  // --- FOOTER ---
  bottomFooter: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 15,
  },
  footerText: {
    fontSize: 8,
    color: colors.textMuted,
  },

  // Badge Acquittée
  paidStamp: {
    marginTop: 20,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 15,
    alignSelf: 'flex-start',
    transform: 'rotate(-5deg)',
  },
  paidText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: 700,
    textTransform: 'uppercase',
    textAlign: 'center',
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
    companyLogoUrl?: string | null
    companySiret?: string
    currencySymbol?: string
    invoicePaymentInstructions?: string
    cancellationInsuranceProviderName?: string
    touristTaxRatePerPersonPerDay?: number
    companyZipCode?: string
    companyCity?: string
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
  const taxRate = settings.touristTaxRatePerPersonPerDay || 1.0

  // Correction : forcer 2 décimales maximum pour éviter les "159,465 €"
  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`
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
  const totalPersons = (booking.adults || 1) + (booking.children || 0)

  const subtotal = booking.basePrice || 0
  const cleaningFee = booking.cleaningPrice || booking.cleaningFee || 0
  const linensFee = booking.linensPrice || 0
  const insuranceFee = booking.insuranceFee || 0
  const taxes = booking.taxes || 0
  const discount = booking.discount || 0
  const total = booking.totalPrice

  // Correction : Arrondir l'acompte à 2 décimales pour que le solde soit juste
  const depositAmount = Number((total * 0.25).toFixed(2))
  const balanceAmount = total - depositAmount

  const isPaid = invoice.status === 'paid'

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* --- HEADER --- */}
        <View style={styles.header}>
          <View style={styles.brandColumn}>
            {settings.companyLogoUrl ? (
              <Image src={settings.companyLogoUrl} style={styles.logoImage} />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Text style={styles.logoInitial}>
                  {settings.companyName ? settings.companyName[0].toUpperCase() : 'S'}
                </Text>
              </View>
            )}
            <Text style={styles.senderName}>{settings.companyName || 'Stayli'}</Text>

            <Text style={styles.senderInfo}>{settings.companyAddress}</Text>
            {(settings.companyZipCode || settings.companyCity) && (
              <Text style={styles.senderInfo}>
                {settings.companyZipCode} {settings.companyCity}
              </Text>
            )}
            <Text style={styles.senderInfo}>{settings.companyEmail}</Text>
            {settings.companyPhoneNumber && (
              <Text style={styles.senderInfo}>{settings.companyPhoneNumber}</Text>
            )}
            {settings.companySiret && (
              <Text style={styles.senderInfo}>SIRET: {settings.companySiret}</Text>
            )}
          </View>

          <View style={styles.invoiceMetaColumn}>
            <Text style={styles.invoiceTitle}>Facture</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Numéro :</Text>
              <Text style={styles.metaValue}>{invoice.invoiceNumber}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Date :</Text>
              <Text style={styles.metaValue}>{formatDate(invoice.issueDate)}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Échéance :</Text>
              <Text style={styles.metaValue}>{formatDate(invoice.dueDate)}</Text>
            </View>
          </View>
        </View>

        {/* --- CLIENT SECTION --- */}
        <View style={styles.clientSection}>
          <View style={{ flex: 1 }}>
            <Text style={styles.clientLabel}>Facturé à</Text>
            <Text style={styles.clientName}>
              {client.firstName} {client.lastName}
            </Text>
            <Text style={styles.clientAddress}>{client.address}</Text>
            <Text style={styles.clientAddress}>
              {client.zipCode} {client.city}
            </Text>
            <Text style={styles.clientAddress}>{client.email}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.clientLabel}>Détails Séjour</Text>
            <Text style={styles.clientAddress}>{property.name}</Text>
            <Text style={[styles.clientAddress, { color: colors.textMuted }]}>
              Arrivée : {formatDate(booking.startDate)} (14h00)
            </Text>
            <Text style={[styles.clientAddress, { color: colors.textMuted }]}>
              Départ : {formatDate(booking.endDate)} (10h00)
            </Text>
          </View>
        </View>

        {/* --- TABLE --- */}
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.colDesc]}>Description</Text>
            <Text style={[styles.headerCell, styles.colPrice]}>Prix Unit.</Text>
            <Text style={[styles.headerCell, styles.colTotal]}>Total</Text>
          </View>

          {/* Ligne Sejour */}
          <View style={styles.tableRow}>
            <View style={styles.colDesc}>
              <Text style={styles.cellText}>Séjour - {property.name}</Text>
              <Text style={styles.cellMuted}>
                {nights} nuits x {totalPersons} personne(s)
              </Text>
            </View>
            <Text style={[styles.cellText, styles.colPrice]}>
              {formatCurrency(subtotal / nights)}
            </Text>
            <Text style={[styles.cellBold, styles.colTotal]}>{formatCurrency(subtotal)}</Text>
          </View>

          {/* Options */}
          {booking.hasCleaning && cleaningFee > 0 && (
            <View style={styles.tableRow}>
              <Text style={[styles.cellText, styles.colDesc]}>Ménage fin de séjour</Text>
              <Text style={[styles.cellText, styles.colPrice]}>{formatCurrency(cleaningFee)}</Text>
              <Text style={[styles.cellBold, styles.colTotal]}>{formatCurrency(cleaningFee)}</Text>
            </View>
          )}

          {booking.hasLinens && linensFee > 0 && (
            <View style={styles.tableRow}>
              <Text style={[styles.cellText, styles.colDesc]}>Linge de maison</Text>
              <Text style={[styles.cellText, styles.colPrice]}>{formatCurrency(linensFee)}</Text>
              <Text style={[styles.cellBold, styles.colTotal]}>{formatCurrency(linensFee)}</Text>
            </View>
          )}

          {booking.hasCancellationInsurance && insuranceFee > 0 && (
            <View style={styles.tableRow}>
              <Text style={[styles.cellText, styles.colDesc]}>
                Assurance annulation ({settings.cancellationInsuranceProviderName || 'Inclus'})
              </Text>
              <Text style={[styles.cellText, styles.colPrice]}>{formatCurrency(insuranceFee)}</Text>
              <Text style={[styles.cellBold, styles.colTotal]}>{formatCurrency(insuranceFee)}</Text>
            </View>
          )}

          {taxes > 0 && (
            <View style={styles.tableRow}>
              <View style={styles.colDesc}>
                <Text style={styles.cellText}>Taxe de séjour</Text>
                <Text style={styles.cellMuted}>
                  {formatCurrency(taxRate)} / pers / nuit ({nights * totalPersons} nuitées taxables)
                </Text>
              </View>
              <Text style={[styles.cellText, styles.colPrice]}>-</Text>
              <Text style={[styles.cellBold, styles.colTotal]}>{formatCurrency(taxes)}</Text>
            </View>
          )}

          {discount > 0 && (
            <View style={styles.tableRow}>
              <Text style={[styles.cellText, styles.colDesc]}>
                Remise {booking.discountType ? `(${booking.discountType})` : ''}
              </Text>
              <Text style={[styles.cellText, styles.colPrice, { color: colors.primary }]}>
                -{formatCurrency(discount)}
              </Text>
              <Text style={[styles.cellBold, styles.colTotal, { color: colors.primary }]}>
                -{formatCurrency(discount)}
              </Text>
            </View>
          )}
        </View>

        {/* --- BOTTOM SECTION --- */}
        <View style={styles.footerSection}>
          {/* Left: Payment Details & Notes */}
          <View style={styles.paymentInfoColumn}>
            <Text style={styles.sectionTitle}>Règlement</Text>

            <View style={styles.paymentRow}>
              <Text style={styles.paymentText}>Acompte (25%) à la réservation</Text>
              <Text style={[styles.paymentText, { fontWeight: 700 }]}>
                {formatCurrency(depositAmount)}
              </Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentText}>Solde à l'arrivée</Text>
              <Text style={[styles.paymentText, { fontWeight: 700 }]}>
                {formatCurrency(balanceAmount)}
              </Text>
            </View>

            {isPaid && (
              <View style={styles.paidStamp}>
                <Text style={styles.paidText}>FACTURE ACQUITTÉE</Text>
              </View>
            )}

            {settings.invoicePaymentInstructions && (
              <View style={{ marginTop: 15 }}>
                <Text style={styles.sectionTitle}>Instructions</Text>
                <Text style={styles.paymentText}>{settings.invoicePaymentInstructions}</Text>
              </View>
            )}
          </View>

          {/* Right: Totals */}
          <View style={styles.totalsColumn}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Sous-total</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(subtotal + cleaningFee + linensFee + insuranceFee)}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Taxes</Text>
              <Text style={styles.totalValue}>{formatCurrency(taxes)}</Text>
            </View>

            <View style={styles.finalTotalRow}>
              <Text style={styles.finalTotalLabel}>Total TTC</Text>
              <Text style={styles.finalTotalValue}>{formatCurrency(total)}</Text>
            </View>
          </View>
        </View>

        {/* --- FOOTER --- */}
        <View style={styles.bottomFooter}>
          <Text style={styles.footerText}>
            Merci de votre confiance. {settings.companyName || 'Stayli'} - {settings.companyEmail}
          </Text>
          <Text style={styles.footerText}>
            En cas de retard de paiement, des pénalités pourront être appliquées conformément à la
            législation en vigueur.
          </Text>
        </View>
      </Page>
    </Document>
  )
}
