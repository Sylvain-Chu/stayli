'use client'

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const styles = StyleSheet.create({
  page: {
    padding: 35,
    fontSize: 9,
    fontFamily: 'Helvetica',
    lineHeight: 1.3,
    color: '#000',
  },
  pageCentered: {
    padding: 35,
    fontSize: 8,
    fontFamily: 'Helvetica',
    lineHeight: 1.25,
    color: '#000',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  mainTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
    textDecoration: 'underline',
    textTransform: 'uppercase',
  },
  propertyTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 3,
    textDecoration: 'underline',
    textTransform: 'uppercase',
  },
  text: {
    marginBottom: 4,
    textAlign: 'justify',
  },
  bold: {
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold',
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginTop: 10,
    marginBottom: 10,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableColDesc: {
    width: '75%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#000',
    padding: 3,
  },
  tableColAmount: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#000',
    padding: 3,
    textAlign: 'right',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  signatureSection: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBlock: {
    width: '40%',
    alignItems: 'center',
  },
  signatureLabel: {
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'left',
  },
  signatureSmall: {
    fontSize: 8,
    fontStyle: 'italic',
  },
  columnsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  column: {
    width: '48%',
  },
  cgTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    textDecoration: 'underline',
    textTransform: 'uppercase',
  },
  cgSectionTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 2,
    textDecoration: 'underline',
    textTransform: 'uppercase',
  },
  cgText: {
    marginBottom: 6,
    textAlign: 'justify',
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  bullet: {
    width: 10,
    fontSize: 9,
  },
  bulletText: {
    flex: 1,
    textAlign: 'justify',
  },
})

interface ContractProps {
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
    touristTaxRatePerPersonPerDay?: number
  }
}

export const ContractPDF = ({ booking, property, client, settings }: ContractProps) => {
  const formatDate = (date: Date | string) => format(new Date(date), 'd MMMM yyyy', { locale: fr })
  const formatPrice = (amount: number) =>
    amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'

  const deposit = booking.totalPrice * 0.25
  const balance = booking.totalPrice - deposit

  const start = new Date(booking.startDate)
  const end = new Date(booking.endDate)
  const nights = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  const totalPersons = (booking.adults || 1) + (booking.children || 0)

  const ownerAddress = settings.companyAddress || ''
  const ownerPhone = settings.companyPhoneNumber ? ` - ${settings.companyPhoneNumber}` : ''
  const clientAddress = client.address || '..............................'
  const clientCity = (client.zipCode || '') + ' ' + (client.city || '')

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.mainTitle}>CONTRAT DE LOCATION SAISONNIERE MEUBLEE</Text>
        <Text style={styles.propertyTitle}>{property.name.toUpperCase()}</Text>

        <View style={{ marginBottom: 10 }}>
          <Text style={[styles.text, styles.bold, { textDecoration: 'underline' }]}>
            Entre les soussignés :
          </Text>
          <Text style={[styles.text, styles.bold]}>{settings.companyName}</Text>
          <Text style={styles.text}>
            Demeurant {ownerAddress}
            {ownerPhone}
          </Text>
          <Text style={styles.text}>Eventuellement représenté par :</Text>
          <Text style={styles.text}>
            Ci-après dénommé(e) <Text style={styles.bold}>LE PROPRIETAIRE</Text> d&apos;une part,
          </Text>
        </View>

        <View style={{ marginBottom: 10 }}>
          <Text style={[styles.text, styles.bold, { textDecoration: 'underline' }]}>Et</Text>
          <Text style={[styles.text, styles.bold]}>
            Madame/Monsieur {client.firstName} {client.lastName}
          </Text>
          <Text style={styles.text}>
            Demeurant {clientAddress} {clientCity}
          </Text>
          <View style={{ flexDirection: 'row' }}>
            <Text style={styles.text}>
              Téléphone fixe : .............................. Téléphone portable :{' '}
              {client.phone || '..............................'}
            </Text>
          </View>
          <Text style={styles.text}>Adresse mail : {client.email}</Text>
          <Text style={styles.text}>
            Ci-après dénommé(e) <Text style={styles.bold}>LE LOCATAIRE</Text> d&apos;autre part,
          </Text>
        </View>

        <Text style={styles.text}>
          Il a été arrêté et convenu ce qui suit, le PROPRIETAIRE louant les locaux ci-après
          désignés au LOCATAIRE qui accepte les conditions suivantes :
        </Text>

        <Text style={styles.sectionTitle}>DESIGNATION DES LIEUX</Text>
        <View style={{ marginBottom: 10 }}>
          <Text style={styles.text}>
            {property.contractDescription ||
              "Studio meublé situé à l'adresse indiquée ci-dessous. Description détaillée non renseignée."}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>DUREE</Text>
        <View style={{ marginBottom: 10 }}>
          <Text style={styles.text}>
            Le présent contrat est consenti et accepté pour une durée de{' '}
            <Text style={styles.bold}>{nights} nuits</Text>, pour {totalPersons} personne(s).
          </Text>
          <Text style={styles.text}>
            Séjour du : <Text style={styles.bold}>{formatDate(booking.startDate)}</Text> à partir de
            14 h 00 au <Text style={styles.bold}>{formatDate(booking.endDate)}</Text> avant : 10 h
            00
          </Text>
        </View>

        {/* TABLEAU */}
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableColDesc}>
              <Text>Montant du loyer :</Text>
            </View>
            <View style={styles.tableColAmount}>
              <Text>{formatPrice(booking.basePrice)}</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableColDesc}>
              <Text>
                Option ménage (
                {booking.cleaningFee > 0 ? formatPrice(booking.cleaningFee) : 'non incluse'}) :
              </Text>
            </View>
            <View style={styles.tableColAmount}>
              <Text>{booking.cleaningFee > 0 ? formatPrice(booking.cleaningFee) : '- €'}</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableColDesc}>
              <Text>
                Option linge de maison (
                {booking.linensPrice > 0 ? formatPrice(booking.linensPrice) : 'non incluse'}) :
              </Text>
            </View>
            <View style={styles.tableColAmount}>
              <Text>{booking.linensPrice > 0 ? formatPrice(booking.linensPrice) : '- €'}</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableColDesc}>
              <Text style={styles.bold}>TOTAL</Text>
            </View>
            <View style={styles.tableColAmount}>
              <Text style={styles.bold}>{formatPrice(booking.totalPrice)}</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={styles.tableColDesc}>
              <Text>Acompte 25%</Text>
            </View>
            <View style={styles.tableColAmount}>
              <Text>{formatPrice(deposit)}</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableColDesc}>
              <Text style={styles.bold}>Solde à la remise des clés</Text>
            </View>
            <View style={styles.tableColAmount}>
              <Text style={styles.bold}>{formatPrice(balance)}</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableColDesc}>
              <Text>
                Taxe de séjour (
                {settings.touristTaxRatePerPersonPerDay
                  ? formatPrice(settings.touristTaxRatePerPersonPerDay)
                  : '1.00 €'}
                /jour et par personne) à la remise des clés
              </Text>
            </View>
            <View style={styles.tableColAmount}>
              <Text>{booking.taxes > 0 ? formatPrice(booking.taxes) : '- €'}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>ETAT DES LIEUX, INVENTAIRE :</Text>
        <View style={{ marginBottom: 5 }}>
          <Text style={styles.text}>
            Un état des lieux contradictoire s&apos;effectuera à l&apos;entrée dans les lieux, ainsi
            qu&apos;au départ du LOCATAIRE.
          </Text>
          <Text style={styles.text}>
            J&apos;ai pris bonne note que sans l&apos;assurance annulation proposée par le
            propriétaire, le solde de la location de ce séjour est dû en cas d&apos;annulation.
          </Text>
          <Text style={[styles.text, { marginTop: 5 }]}>
            Le présent contrat est rédigé en deux exemplaires et signé par chacune des Parties.
          </Text>
        </View>

        <Text style={{ marginTop: 10, marginBottom: 5 }}>
          Fait à : ......................................................, le
          .......................................
        </Text>

        <View style={styles.signatureSection}>
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureLabel}>Le PROPRIETAIRE</Text>
            <Text style={styles.signatureSmall}>(lu et approuvé)</Text>
          </View>

          <View style={styles.signatureBlock}>
            <Text style={styles.signatureLabel}>Le(s) LOCATAIRE (S)</Text>
            <Text style={styles.signatureSmall}>(lu et approuvé)</Text>
          </View>
        </View>
      </Page>

      <Page size="A4" style={styles.pageCentered}>
        <Text style={styles.cgTitle}>CONDITIONS GENERALES</Text>

        <View style={styles.columnsContainer}>
          <View style={styles.column}>
            <Text style={styles.cgText}>
              La présente location est conclue à titre de résidence provisoire et de plaisance, les
              locaux ne pourront être utilisés à titre d&apos;habitation principale ou même
              secondaire et le Locataire ne pourra y pratiquer aucune activité commerciale,
              artisanale ou professionnelle. En conséquence, le contrat sera régi par les
              dispositions du Code Civil ainsi que par les conditions prévues aux présentes.
            </Text>
            <Text style={styles.cgText}>
              Le bail cesse de plein droit à l&apos;expiration du terme fixé au recto, sans
              qu&apos;il soit besoin de donner congé. La location ne pourra être prorogée sans
              l&apos;accord préalable écrit du Propriétaire.
            </Text>

            <Text style={styles.cgSectionTitle}>RESERVATION PAR LE LOCATAIRE</Text>
            <Text style={styles.cgText}>
              Le Locataire effectuant une réservation signe et renvoie au Propriétaire le contrat
              accompagné impérativement de l&apos;acompte dont le montant est indiqué au recto, le
              solde de la location reste payable à la remise des clés dès l&apos;arrivée.
            </Text>

            <Text style={styles.cgSectionTitle}>DEPOT DE GARANTIE</Text>
            <Text style={styles.cgText}>
              Indiqué au recto du contrat comme le montant du séjour (hors taxe de séjour) le
              montant est défini au recto à titre de dépôt de garantie pour répondre des dégâts qui
              pourraient être causés aux objets, mobiliers et autres garnissant les lieux loués.
            </Text>
            <Text style={styles.cgText}>
              Au départ du Locataire, après restitution des clés et en l&apos;absence de dégradation
              constatée dans l&apos;état des lieux de sortie contradictoirement établi par les
              parties, le dépôt de garantie sera immédiatement et intégralement restitué.
            </Text>
            <Text style={styles.cgText}>
              A défaut, le dépôt de garantie sera restitué, déduction faite des réparations
              locatives, au plus tard dans les 60 jours qui suivent le départ du Locataire.
            </Text>

            <Text style={styles.cgSectionTitle}>OBLIGATIONS DU LOCATAIRE</Text>
            <Text style={styles.cgText}>
              Le Locataire devra occuper le Bien sans changer la disposition des meubles, ne rien
              faire qui, de son fait ou du fait de sa famille ou de ses relations, puisse nuire à la
              tranquillité du voisinage ou des autres occupants. Il prévient le Propriétaire de son
              départ.
            </Text>
            <Text style={styles.cgText}>
              Le Propriétaire s&apos;oblige à délivrer les lieux loués suivant descriptif, un
              inventaire est établi à l&apos;arrivée ainsi que l&apos;état de propreté. Le Locataire
              devra à son départ laisser les lieux au même état qu&apos;à l&apos;arrivée.
            </Text>
          </View>

          <View style={styles.column}>
            <Text style={[styles.cgSectionTitle, { marginTop: 0 }]}>ASSURANCE</Text>
            <Text style={styles.cgText}>
              Le Locataire est responsable de tous les dommages survenant de son fait. Il{' '}
              <Text style={styles.bold}>est</Text> tenu d&apos;être assuré par un contrat type
              villégiature pour ces différents risques (voir clauses particulières de votre
              assurance incendie responsabilité civile).
            </Text>
            <Text style={styles.cgText}>
              Le Propriétaire lui soumet systématiquement une proposition d&apos;assurance
              annulation (type voyage) adaptée aux périodes de cure.
            </Text>

            <Text style={styles.cgSectionTitle}>ANNULATION</Text>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={[styles.bulletText, styles.bold]}>Avant l&apos;arrivée :</Text>
            </View>
            <Text style={styles.cgText}>
              Si le Locataire a souscrit une assurance annulation, son acompte lui sera remboursé
              par la Compagnie d&apos;Assurance, et le solde ne lui sera pas réclamé ; Dans tous les
              cas l&apos;acompte reste au Propriétaire.
            </Text>
            <Text style={styles.cgText}>
              <Text style={styles.bold}>Sans assurance</Text>, le solde de la location est dû au
              propriétaire.
            </Text>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={[styles.bulletText, styles.bold]}>Si le séjour est écourté :</Text>
            </View>
            <Text style={styles.cgText}>
              Le prix total de la location reste acquis au Propriétaire. Il ne sera procédé à aucun
              remboursement partiel ou au prorata du temps.
            </Text>

            <Text
              style={[styles.cgText, styles.bold, { textDecoration: 'underline', marginTop: 4 }]}
            >
              ATTENTION : sans assurance annulation, le solde de la location est dû au Propriétaire.
            </Text>
            <Text style={styles.cgText}>
              En cas d&apos;annulation quel qu&apos;en soit le motif, le Locataire devra aviser
              impérativement le Propriétaire de son annulation, dans les meilleurs délais et au plus
              tard dans les CINQ JOURS suivant l&apos;apparition de l&apos;évènement, faute de quoi
              l&apos;annulation de la location ne pourra être prise en charge par la Compagnie
              d&apos;Assurance.
            </Text>

            <Text style={styles.cgSectionTitle}>RESERVATION DEFINITIVE</Text>
            <Text style={styles.cgText}>
              La réservation devient effective lorsque le Locataire aura fait parvenir au
              Propriétaire un acompte de 25% du montant total de la location, et de la signature du
              présent contrat.
            </Text>
            <Text style={styles.cgText}>
              Un reçu lui confirmant la bonne réception du document sera envoyé au Locataire.
            </Text>
            <Text style={styles.cgText}>
              Le solde de la location est à régler le jour de l&apos;arrivée.
            </Text>

            <Text style={styles.cgSectionTitle}>DEPART ET ARRIVEE</Text>
            <Text style={styles.cgText}>
              Heures fixées par le Propriétaire et en accord avec le Locataire.
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
