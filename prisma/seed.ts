import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding properties (upsert)...');
  const propertiesData = [
    { name: 'Seaside Villa', address: '1 Ocean Dr, Nice', description: 'Sea view' },
    { name: 'Mountain Cabin', address: '12 High Peak Rd', description: 'Cozy cabin' },
    { name: 'City Flat', address: '45 Center St', description: 'Close to amenities' },
  ];

  for (const p of propertiesData) {
    const existing = await prisma.property.findFirst({ where: { name: p.name } });
    if (existing) {
      await prisma.property.update({
        where: { id: existing.id },
        data: { address: p.address, description: p.description },
      });
    } else {
      await prisma.property.create({ data: p });
    }
  }

  console.log('Seeding clients (upsert)...');
  const clientsData = [
    { firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', phone: '123-456-7890' },
    {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '987-654-3210',
    },
  ];

  for (const c of clientsData) {
    await prisma.client.upsert({
      where: { email: c.email },
      update: { firstName: c.firstName, lastName: c.lastName, phone: c.phone },
      create: c,
    });
  }

  console.log('Seeding sample bookings...');
  const seaside = await prisma.property.findFirst({ where: { name: 'Seaside Villa' } });
  const john = await prisma.client.findUnique({ where: { email: 'john.doe@example.com' } });
  if (seaside && john) {
    await prisma.booking
      .upsert({
        where: { id: 'booking-seaside-john' },
        update: {},
        create: {
          id: 'booking-seaside-john',
          startDate: new Date(),
          endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
          totalPrice: 1200,
          propertyId: seaside.id,
          clientId: john.id,
        },
      })
      .catch(() => {});
  }

  console.log('Seeding sample invoices...');
  const booking = await prisma.booking.findFirst({ where: { propertyId: seaside?.id } });
  if (booking) {
    await prisma.invoice
      .upsert({
        where: { invoiceNumber: 'INV-1000' },
        update: {},
        create: {
          invoiceNumber: 'INV-1000',
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
          amount: 1200,
          bookingId: booking.id,
        },
      })
      .catch(() => {});
  }

  console.log('Seeding done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
