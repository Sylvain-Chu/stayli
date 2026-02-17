'use client'

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

// ============ Styles ============

const styles = StyleSheet.create({
  // Page 1
  page: {
    paddingTop: 30,
    paddingBottom: 30,
    paddingHorizontal: 70,
    fontSize: 10,
    fontFamily: 'Helvetica',
    lineHeight: 1.15,
    color: '#000',
  },
  mainTitle: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  propertyTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginTop: 5,
    marginBottom: 2,
    textDecoration: 'underline',
    textTransform: 'uppercase',
  },
  text: {
    marginBottom: 1,
    textAlign: 'justify',
  },
  bold: {
    fontFamily: 'Helvetica-Bold',
  },
  italic: {
    fontStyle: 'italic',
  },

  // Table
  table: {
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginTop: 4,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableColLabel: {
    width: '75%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#000',
    paddingVertical: 2,
    paddingHorizontal: 5,
  },
  tableColAmount: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#000',
    paddingVertical: 2,
    paddingHorizontal: 5,
    textAlign: 'right',
  },

  // Signatures
  signatureSection: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBlock: {
    width: '45%',
    alignItems: 'center',
  },
  signatureLabel: {
    fontFamily: 'Helvetica-Bold',
    marginBottom: 3,
    textAlign: 'center',
  },
  signatureNote: {
    fontSize: 11,
    marginTop: 3,
    textAlign: 'center',
  },

  // Page 2 - Conditions Generales
  pageCG: {
    paddingTop: 25,
    paddingBottom: 25,
    paddingHorizontal: 50,
    fontSize: 8,
    fontFamily: 'Helvetica',
    lineHeight: 1.15,
    color: '#000',
  },
  cgSpacer: {
    flexGrow: 1,
  },
  cgTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginBottom: 10,
    textDecoration: 'underline',
    textTransform: 'uppercase',
  },
  columnsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  column: {
    width: '48.5%',
  },
  cgSectionTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    marginTop: 6,
    marginBottom: 2,
    textTransform: 'uppercase',
    textDecoration: 'underline',
  },
  cgText: {
    fontSize: 9,
    marginBottom: 3,
    textAlign: 'justify',
    lineHeight: 1.2,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 1,
  },
  bullet: {
    width: 6,
    fontSize: 8,
  },
  bulletText: {
    fontSize: 9,
    flex: 1,
    textAlign: 'justify',
  },
})

// ============ Types ============

export interface ContractProps {
  booking: {
    id: string
    startDate: Date | string
    endDate: Date | string
    totalPrice: number
    basePrice: number
    cleaningFee: number
    linensPrice: number
    insuranceFee: number
    taxes: number
    adults: number
    children: number
    hasCancellationInsurance: boolean
    hasLinens: boolean
    hasCleaning: boolean
    cleaningPrice: number
  }
  property: {
    name: string
    address: string | null
    contractDescription: string | null
  }
  client: {
    firstName: string
    lastName: string
    email: string
    phone: string | null
    address?: string | null
    zipCode?: string | null
    city?: string | null
  }
  settings: {
    companyName: string
    companyAddress: string | null
    companyPhoneNumber?: string | null
    companyEmail?: string | null
    companySiret?: string | null
    companyZipCode?: string | null
    companyCity?: string | null
    touristTaxRatePerPersonPerDay?: number
    depositPercentage?: number
    securityDepositAmount?: number
    checkInTime?: string
    checkOutTime?: string
    cancellationInsurancePercentage?: number
    cancellationInsuranceProviderName?: string
    cleaningOptionPrice?: number
    linensOptionPrice?: number
  }
}

// ============ Helpers ============

function fmtDate(date: Date | string): string {
  return format(new Date(date), 'd MMMM yyyy', { locale: fr })
}

function fmtPrice(amount: number): string {
  return (
    amount.toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + ' €'
  )
}

function fmtTime(time: string | undefined, fallback: string): string {
  if (!time) return fallback
  const [h, m] = time.split(':')
  return h + ' h ' + m
}

function calcNights(start: Date | string, end: Date | string): number {
  const s = new Date(start)
  const e = new Date(end)
  return Math.ceil(Math.abs(e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24))
}

// ============ Sub-components ============

function PriceRow({
  label,
  amount,
  isBold = false,
}: {
  label: string
  amount: string
  isBold?: boolean
}) {
  const textStyle = isBold ? styles.bold : undefined
  return (
    <View style={styles.tableRow}>
      <View style={styles.tableColLabel}>
        <Text style={textStyle}>{label}</Text>
      </View>
      <View style={styles.tableColAmount}>
        <Text style={textStyle}>{amount}</Text>
      </View>
    </View>
  )
}

// ============ Page 1: Contrat ============

function ContractPage({ booking, property, client, settings }: ContractProps) {
  const nights = calcNights(booking.startDate, booking.endDate)
  const totalPersons = (booking.adults || 1) + (booking.children || 0)

  const depositPct = settings.depositPercentage ?? 25
  const deposit = booking.totalPrice * (depositPct / 100)
  const balance = booking.totalPrice - deposit

  const checkIn = fmtTime(settings.checkInTime, '14 h 00')
  const checkOut = fmtTime(settings.checkOutTime, '10 h 00')

  const ownerAddressParts = [
    settings.companyAddress,
    [settings.companyZipCode, settings.companyCity].filter(Boolean).join(' '),
  ].filter(Boolean)
  const ownerAddress = ownerAddressParts.join(', ')
  const ownerPhone = settings.companyPhoneNumber ? ' - ' + settings.companyPhoneNumber : ''

  const clientAddress = client.address || '..............................'
  const clientCityLine = [client.zipCode, client.city].filter(Boolean).join(' ')
  const taxRate = settings.touristTaxRatePerPersonPerDay ?? 1

  const cleaningOptionLabel = settings.cleaningOptionPrice
    ? fmtPrice(settings.cleaningOptionPrice)
    : booking.cleaningPrice > 0
      ? fmtPrice(booking.cleaningPrice)
      : booking.cleaningFee > 0
        ? fmtPrice(booking.cleaningFee)
        : ''
  const linensOptionLabel = settings.linensOptionPrice
    ? fmtPrice(settings.linensOptionPrice)
    : booking.linensPrice > 0
      ? fmtPrice(booking.linensPrice)
      : ''

  const cleaningAmount =
    booking.hasCleaning && booking.cleaningPrice > 0
      ? booking.cleaningPrice
      : booking.cleaningFee > 0
        ? booking.cleaningFee
        : 0
  const linensAmount = booking.hasLinens ? booking.linensPrice : 0

  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.mainTitle}>{'CONTRAT DE LOCATION SAISONNIERE MEUBLEE'}</Text>
      <Text style={styles.propertyTitle}>{property.name.toUpperCase()}</Text>

      <View style={{ marginBottom: 3 }}>
        <Text style={[styles.text, styles.bold]}>{'Entre les soussignés :'}</Text>
        <Text style={styles.text}>{settings.companyName}</Text>
        <Text style={styles.text}>{'Demeurant ' + ownerAddress + ownerPhone}</Text>
        <Text style={styles.text}>{'Eventuellement représenté par :'}</Text>
        <Text style={styles.text}>
          {'Ci-après dénommé(e) '}
          <Text style={styles.bold}>LE PROPRIETAIRE</Text>
          {" d'une part,"}
        </Text>
      </View>

      <View style={{ marginBottom: 3 }}>
        <Text style={[styles.text, styles.bold]}>Et</Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>
            {'Madame/Monsieur ' + client.firstName + ' ' + client.lastName}
          </Text>
        </Text>
        <Text style={styles.text}>
          {'Demeurant ' + clientAddress + (clientCityLine ? ' - ' + clientCityLine : '')}
        </Text>
        <Text style={styles.text}>
          {'Téléphone fixe : .............................. Téléphone portable : ' +
            (client.phone || '..............................')}
        </Text>
        <Text style={styles.text}>{'Adresse mail : ' + client.email}</Text>
        <Text style={styles.text}>
          {'Ci-après dénommé(e) '}
          <Text style={styles.bold}>LE LOCATAIRE</Text>
          {" d'autre part,"}
        </Text>
      </View>

      <Text style={[styles.text, { marginBottom: 2 }]}>
        {
          'Il a été arrêté et convenu ce qui suit, le PROPRIETAIRE louant les locaux ci-après désignés au LOCATAIRE qui accepte les conditions suivantes :'
        }
      </Text>

      <Text style={styles.sectionTitle}>DESIGNATION DES LIEUX</Text>
      <Text style={styles.text}>
        {property.contractDescription ||
          'Logement meublé situé ' +
            (property.address || "à l'adresse du bien") +
            '. Description détaillée non renseignée.'}
      </Text>

      <Text style={styles.sectionTitle}>DUREE</Text>
      <Text style={styles.text}>
        {'Le présent contrat est consenti et accepté pour une durée de '}
        <Text style={styles.bold}>{nights + ' nuit' + (nights > 1 ? 's' : '')}</Text>
        {', pour ' + totalPersons + ' personne' + (totalPersons > 1 ? 's' : '')}
      </Text>
      <Text style={[styles.text, { marginTop: 10 }]}>
        {'Séjour du : '}
        <Text style={styles.bold}>{fmtDate(booking.startDate)}</Text>
        {' à partir de ' + checkIn + ' au '}
        <Text style={styles.bold}>{fmtDate(booking.endDate)}</Text>
        {' avant : ' + checkOut}
      </Text>

      <View style={styles.table}>
        <PriceRow label="Montant du loyer :" amount={fmtPrice(booking.basePrice)} />
        <PriceRow
          label={'Option ménage (' + (cleaningOptionLabel || 'non incluse') + ') :'}
          amount={cleaningAmount > 0 ? fmtPrice(cleaningAmount) : '- €'}
        />
        <PriceRow
          label={'Option linge de maison (' + (linensOptionLabel || 'non incluse') + ') :'}
          amount={linensAmount > 0 ? fmtPrice(linensAmount) : '- €'}
        />
        {booking.hasCancellationInsurance && booking.insuranceFee > 0 && (
          <PriceRow
            label={
              'Assurance annulation' +
              (settings.cancellationInsuranceProviderName
                ? ' ' + settings.cancellationInsuranceProviderName
                : '') +
              ' :'
            }
            amount={fmtPrice(booking.insuranceFee)}
          />
        )}
        <PriceRow label="TOTAL" amount={fmtPrice(booking.totalPrice)} isBold />
        <PriceRow label={'Acompte ' + depositPct + '%'} amount={fmtPrice(deposit)} />
        <PriceRow label={'Solde à la remise des clés'} amount={fmtPrice(balance)} isBold />
        <PriceRow
          label={
            'Taxe de séjour (' + fmtPrice(taxRate) + '/jour et par personne) à la remise des clés'
          }
          amount={
            booking.taxes > 0 ? fmtPrice(booking.taxes) : fmtPrice(taxRate * nights * totalPersons)
          }
        />
      </View>

      <Text style={styles.sectionTitle}>{'ETAT DES LIEUX, INVENTAIRE :'}</Text>
      <Text style={styles.text}>
        {
          "Un état des lieux contradictoire s'effectuera à l'entrée dans les lieux, ainsi qu'au départ du LOCATAIRE."
        }
      </Text>
      <Text style={[styles.text, styles.bold, { marginTop: 10 }]}>
        {
          "J'ai pris bonne note que sans l'assurance annulation proposée par le propriétaire, le solde de la location de ce séjour est dû en cas d'annulation."
        }
      </Text>

      <Text style={[styles.text, { marginTop: 10 }]}>
        {'Le présent contrat est rédigé en deux exemplaires et signé par chacune des Parties.'}
      </Text>

      <Text style={{ marginTop: 8, textAlign: 'center' }}>
        {'Fait à : ……………………………………………… le ………………………..'}
      </Text>

      <View style={styles.signatureSection}>
        <View style={styles.signatureBlock}>
          <Text style={styles.signatureLabel}>Le PROPRIETAIRE</Text>
          <Text style={styles.signatureNote}>{'(lu et approuvé)'}</Text>
        </View>
        <View style={styles.signatureBlock}>
          <Text style={styles.signatureLabel}>Le(s) LOCATAIRE (S)</Text>
          <Text style={styles.signatureNote}>{'(lu et approuvé)'}</Text>
        </View>
      </View>
    </Page>
  )
}

// ============ Page 2: Conditions Generales ============

function ConditionsPage({ settings }: Pick<ContractProps, 'settings'>) {
  const depositPct = settings.depositPercentage ?? 25

  return (
    <Page size="A4" style={styles.pageCG}>
      <View style={styles.cgSpacer} />
      <Text style={styles.cgTitle}>CONDITIONS GENERALES</Text>

      <View style={styles.columnsContainer}>
        <View style={styles.column}>
          <Text style={styles.cgText}>
            {
              "La présente location est conclue à titre de résidence provisoire et de plaisance, les locaux ne pourront être utilisés à titre d'habitation principale ou même secondaire et le Locataire ne pourra y pratiquer aucune activité commerciale, artisanale ou professionnelle. En conséquence, le contrat sera régi par les dispositions du Code Civil ainsi que par les conditions prévues aux présentes."
            }
          </Text>
          <Text style={styles.cgText}>
            {
              "Le bail cesse de plein droit à l'expiration du terme fixé au recto, sans qu'il soit besoin de donner congé. La location ne pourra être prorogée sans l'accord préalable écrit du Propriétaire."
            }
          </Text>

          <Text style={styles.cgSectionTitle}>RESERVATION PAR LE LOCATAIRE</Text>
          <Text style={styles.cgText}>
            {
              "Le Locataire effectuant une réservation signe et renvoie au Propriétaire le contrat accompagné impérativement de l'acompte dont le montant est indiqué au recto, le solde de la location reste payable à la remise des clés dès l'arrivée."
            }
          </Text>

          <Text style={styles.cgSectionTitle}>DEPOT DE GARANTIE</Text>
          <Text style={styles.cgText}>
            {
              'Indiqué au recto du contrat comme le montant du séjour (hors taxe de séjour) le montant est défini au recto à titre de dépôt de garantie pour répondre des dégâts qui pourraient être causés aux objets, mobiliers et autres garnissant les lieux loués.'
            }
          </Text>
          <Text style={styles.cgText}>
            {
              "Au départ du Locataire, après restitution des clés et en l'absence de dégradation constatée dans l'état des lieux de sortie contradictoirement établi par les parties, le dépôt de garantie sera immédiatement et intégralement restitué."
            }
          </Text>
          <Text style={styles.cgText}>
            {
              'A défaut, le dépôt de garantie sera restitué, déduction faite des réparations locatives, au plus tard dans les 60 jours qui suivent le départ du Locataire.'
            }
          </Text>

          <Text style={styles.cgSectionTitle}>OBLIGATIONS DU LOCATAIRE</Text>
          <Text style={styles.cgText}>
            {
              'Le Locataire devra occuper le Bien sans changer la disposition des meubles, ne rien faire qui, de son fait ou du fait de sa famille ou de ses relations, puisse nuire à la tranquillité du voisinage ou des autres occupants. Il prévient le Propriétaire de son départ.'
            }
          </Text>
          <Text style={styles.cgText}>
            {
              "Le Propriétaire s'oblige à délivrer les lieux loués suivant descriptif, un inventaire est établi à l'arrivée ainsi que l'état de propreté. Le Locataire devra à son départ laisser les lieux au même état qu'à l'arrivée."
            }
          </Text>
        </View>

        <View style={styles.column}>
          <Text style={[styles.cgSectionTitle, { marginTop: 0 }]}>ASSURANCE</Text>
          <Text style={styles.cgText}>
            {'Le Locataire est responsable de tous les dommages survenant de son fait. Il '}
            <Text style={styles.bold}>est</Text>
            {
              " tenu d'être assuré par un contrat type villégiature pour ces différents risques (voir clauses particulières de votre assurance incendie responsabilité civile)."
            }
          </Text>
          <Text style={styles.cgText}>
            {
              "Le Propriétaire lui soumet systématiquement une proposition d'assurance annulation (type voyage) adaptée aux périodes de cure."
            }
          </Text>

          <Text style={styles.cgSectionTitle}>ANNULATION</Text>

          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>{'•'}</Text>
            <Text style={[styles.bulletText, styles.bold]}>{"Avant l'arrivée :"}</Text>
          </View>
          <Text style={styles.cgText}>
            {
              "Si le Locataire a souscrit une assurance annulation, son acompte lui sera remboursé par la Compagnie d'Assurance, et le solde ne lui sera pas réclamé ; Dans tous les cas l'acompte reste au Propriétaire."
            }
          </Text>
          <Text style={styles.cgText}>
            <Text style={styles.bold}>Sans assurance</Text>
            {', le solde de la location est dû au propriétaire.'}
          </Text>

          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>{'•'}</Text>
            <Text style={[styles.bulletText, styles.bold]}>{'Si le séjour est écourté :'}</Text>
          </View>
          <Text style={styles.cgText}>
            {
              'Le prix total de la location reste acquis au Propriétaire. Il ne sera procédé à aucun remboursement partiel ou au prorata du temps.'
            }
          </Text>

          <Text style={[styles.cgText, styles.bold, { textDecoration: 'underline', marginTop: 3 }]}>
            {
              'ATTENTION : sans assurance annulation, le solde de la location est dû au Propriétaire.'
            }
          </Text>
          <Text style={styles.cgText}>
            {
              "En cas d'annulation quel qu'en soit le motif, le Locataire devra aviser impérativement le Propriétaire de son annulation, dans les meilleurs délais et au plus tard dans les CINQ JOURS suivant l'apparition de l'évènement, faute de quoi l'annulation de la location ne pourra être prise en charge par la Compagnie d'Assurance."
            }
          </Text>

          <Text style={styles.cgSectionTitle}>RESERVATION DEFINITIVE</Text>
          <Text style={styles.cgText}>
            {'La réservation devient effective lorsque le Locataire aura fait parvenir au Propriétaire un acompte de ' +
              depositPct +
              '% du montant total de la location, et de la signature du présent contrat.'}
          </Text>
          <Text style={styles.cgText}>
            {'Un reçu lui confirmant la bonne réception du document sera envoyé au Locataire.'}
          </Text>
          <Text style={styles.cgText}>
            {"Le solde de la location est à régler le jour de l'arrivée."}
          </Text>

          <Text style={styles.cgSectionTitle}>DEPART ET ARRIVEE</Text>
          <Text style={styles.cgText}>
            {'Heures fixées par le Propriétaire et en accord avec le Locataire.'}
          </Text>
        </View>
      </View>
      <View style={styles.cgSpacer} />
    </Page>
  )
}

// ============ Main Component ============

export function ContractPDF({ booking, property, client, settings }: ContractProps) {
  return (
    <Document>
      <ContractPage booking={booking} property={property} client={client} settings={settings} />
      <ConditionsPage settings={settings} />
    </Document>
  )
}
