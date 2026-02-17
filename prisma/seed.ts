import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Starting seeding...')

  // Clean existing data
  await prisma.invoice.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.client.deleteMany()
  await prisma.property.deleteMany()

  console.log('Existing data deleted')

  // Create properties
  const properties = await Promise.all([
    prisma.property.create({
      data: {
        name: 'Villa Méditerranée',
        address: '123 Avenue de la Mer, 06400 Cannes',
        description: 'Magnifique villa avec vue sur mer, piscine privée et 5 chambres',
      },
    }),
    prisma.property.create({
      data: {
        name: 'Appartement Centre-Ville',
        address: '45 Rue de la République, 75001 Paris',
        description: 'Appartement moderne en plein cœur de Paris, 3 chambres, métro à 2 min',
      },
    }),
    prisma.property.create({
      data: {
        name: 'Chalet Montagne',
        address: '78 Route des Alpes, 74400 Chamonix',
        description: 'Chalet authentique au pied des pistes, 6 chambres, sauna et jacuzzi',
      },
    }),
    prisma.property.create({
      data: {
        name: 'Studio Plage',
        address: '12 Promenade du Bord de Mer, 64200 Biarritz',
        description: 'Studio cosy face à la mer, idéal pour 2 personnes',
      },
    }),
    prisma.property.create({
      data: {
        name: 'Maison de Campagne',
        address: '56 Chemin des Vignes, 84000 Avignon',
        description: 'Maison provençale avec jardin, 4 chambres, calme absolu',
      },
    }),
  ])

  console.log(`${properties.length} properties created`)

  // Create clients
  const clients = await Promise.all([
    prisma.client.create({
      data: {
        firstName: 'Marie',
        lastName: 'Dupont',
        email: 'marie.dupont@email.com',
        phone: '06 12 34 56 78',
      },
    }),
    prisma.client.create({
      data: {
        firstName: 'Pierre',
        lastName: 'Martin',
        email: 'pierre.martin@email.com',
        phone: '06 23 45 67 89',
      },
    }),
    prisma.client.create({
      data: {
        firstName: 'Sophie',
        lastName: 'Bernard',
        email: 'sophie.bernard@email.com',
        phone: '06 34 56 78 90',
      },
    }),
    prisma.client.create({
      data: {
        firstName: 'Jean',
        lastName: 'Lefebvre',
        email: 'jean.lefebvre@email.com',
        phone: '06 45 67 89 01',
      },
    }),
    prisma.client.create({
      data: {
        firstName: 'Claire',
        lastName: 'Moreau',
        email: 'claire.moreau@email.com',
        phone: '06 56 78 90 12',
      },
    }),
    prisma.client.create({
      data: {
        firstName: 'Thomas',
        lastName: 'Dubois',
        email: 'thomas.dubois@email.com',
        phone: '06 67 89 01 23',
      },
    }),
    prisma.client.create({
      data: {
        firstName: 'Emma',
        lastName: 'Laurent',
        email: 'emma.laurent@email.com',
        phone: '06 78 90 12 34',
      },
    }),
    prisma.client.create({
      data: {
        firstName: 'Lucas',
        lastName: 'Simon',
        email: 'lucas.simon@email.com',
        phone: '06 89 01 23 45',
      },
    }),
  ])

  console.log(`${clients.length} clients created`)

  // Create bookings with varied dates
  const now = new Date()
  const bookings = []

  // Past bookings (with paid invoices)
  for (let i = 0; i < 5; i++) {
    const startDate = new Date(now)
    startDate.setMonth(now.getMonth() - 3 + i)
    startDate.setDate(5)

    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 7)

    const basePrice = 800 + Math.random() * 1200
    const cleaningFee = 80
    const taxes = basePrice * 0.1
    const totalPrice = basePrice + cleaningFee + taxes

    const booking = await prisma.booking.create({
      data: {
        startDate,
        endDate,
        basePrice,
        cleaningFee,
        taxes,
        totalPrice,
        adults: Math.floor(Math.random() * 4) + 1,
        children: Math.floor(Math.random() * 3),
        status: i === 4 ? 'cancelled' : 'confirmed',
        propertyId: properties[i % properties.length].id,
        clientId: clients[i % clients.length].id,
      },
    })

    bookings.push(booking)

    // Create a paid invoice
    const issueDate = new Date(startDate)
    issueDate.setDate(startDate.getDate() - 30)

    const dueDate = new Date(issueDate)
    dueDate.setDate(issueDate.getDate() + 15)

    const invoiceNumber = `INV-${issueDate.getFullYear()}${String(issueDate.getMonth() + 1).padStart(2, '0')}${String(i + 1).padStart(4, '0')}`

    await prisma.invoice.create({
      data: {
        invoiceNumber,
        issueDate,
        dueDate,
        amount: totalPrice,
        status: 'paid',
        bookingId: booking.id,
      },
    })
  }

  // Current bookings (with sent invoices)
  for (let i = 0; i < 3; i++) {
    const startDate = new Date(now)
    startDate.setDate(now.getDate() - 5 + i * 3)

    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 10)

    const basePrice = 1000 + Math.random() * 1500
    const cleaningFee = 100
    const taxes = basePrice * 0.1
    const linensPrice = 50
    const totalPrice = basePrice + cleaningFee + taxes + linensPrice

    const booking = await prisma.booking.create({
      data: {
        startDate,
        endDate,
        basePrice,
        cleaningFee,
        taxes,
        totalPrice,
        hasLinens: true,
        linensPrice,
        adults: Math.floor(Math.random() * 4) + 2,
        children: Math.floor(Math.random() * 2),
        status: 'confirmed',
        propertyId: properties[(i + 1) % properties.length].id,
        clientId: clients[(i + 2) % clients.length].id,
      },
    })

    bookings.push(booking)

    // Create a sent invoice
    const issueDate = new Date(startDate)
    issueDate.setDate(startDate.getDate() - 20)

    const dueDate = new Date(now)
    dueDate.setDate(now.getDate() + 10 + i * 5)

    const invoiceNumber = `INV-${issueDate.getFullYear()}${String(issueDate.getMonth() + 1).padStart(2, '0')}${String(i + 6).padStart(4, '0')}`

    await prisma.invoice.create({
      data: {
        invoiceNumber,
        issueDate,
        dueDate,
        amount: totalPrice,
        status: 'sent',
        bookingId: booking.id,
      },
    })
  }

  // Past bookings (with overdue invoices)
  for (let i = 0; i < 2; i++) {
    const startDate = new Date(now)
    startDate.setMonth(now.getMonth() - 1)
    startDate.setDate(15 + i * 5)

    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 5)

    const basePrice = 600 + Math.random() * 800
    const cleaningFee = 60
    const taxes = basePrice * 0.1
    const totalPrice = basePrice + cleaningFee + taxes

    const booking = await prisma.booking.create({
      data: {
        startDate,
        endDate,
        basePrice,
        cleaningFee,
        taxes,
        totalPrice,
        adults: 2,
        children: 0,
        status: 'pending',
        propertyId: properties[(i + 2) % properties.length].id,
        clientId: clients[(i + 5) % clients.length].id,
      },
    })

    bookings.push(booking)

    // Create an overdue invoice
    const issueDate = new Date(startDate)
    issueDate.setDate(startDate.getDate() - 25)

    const dueDate = new Date(now)
    dueDate.setDate(now.getDate() - 5 - i * 3)

    const invoiceNumber = `INV-${issueDate.getFullYear()}${String(issueDate.getMonth() + 1).padStart(2, '0')}${String(i + 9).padStart(4, '0')}`

    await prisma.invoice.create({
      data: {
        invoiceNumber,
        issueDate,
        dueDate,
        amount: totalPrice,
        status: 'sent',
        bookingId: booking.id,
      },
    })
  }

  // Future bookings (upcoming)
  for (let i = 0; i < 4; i++) {
    const startDate = new Date(now)
    startDate.setMonth(now.getMonth() + 1 + Math.floor(i / 2))
    startDate.setDate(10 + i * 7)

    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 14)

    const basePrice = 1200 + Math.random() * 2000
    const cleaningFee = 120
    const taxes = basePrice * 0.1
    const insuranceFee = 50
    const totalPrice = basePrice + cleaningFee + taxes + insuranceFee

    const booking = await prisma.booking.create({
      data: {
        startDate,
        endDate,
        basePrice,
        cleaningFee,
        taxes,
        totalPrice,
        hasCancellationInsurance: true,
        insuranceFee,
        adults: Math.floor(Math.random() * 6) + 2,
        children: Math.floor(Math.random() * 4),
        status: i < 2 ? 'pending' : 'confirmed',
        propertyId: properties[(i + 3) % properties.length].id,
        clientId: clients[(i + 3) % clients.length].id,
      },
    })

    bookings.push(booking)

    // Create a draft or sent invoice
    const issueDate = new Date(now)

    const dueDate = new Date(startDate)
    dueDate.setDate(startDate.getDate() - 7)

    const invoiceNumber = `INV-${issueDate.getFullYear()}${String(issueDate.getMonth() + 1).padStart(2, '0')}${String(i + 11).padStart(4, '0')}`

    await prisma.invoice.create({
      data: {
        invoiceNumber,
        issueDate,
        dueDate,
        amount: totalPrice,
        status: i % 2 === 0 ? 'draft' : 'sent',
        bookingId: booking.id,
      },
    })
  }

  console.log(`${bookings.length} bookings created`)

  const totalInvoices = await prisma.invoice.count()
  console.log(`${totalInvoices} invoices created`)

  console.log('Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
