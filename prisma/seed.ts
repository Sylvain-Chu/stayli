import { PrismaClient } from '@prisma/client';
import { existsSync } from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';

// Load .env.local if present, else .env so DATABASE_URL is available when running via ts-node
const localEnv = path.join(process.cwd(), '.env.local');
if (existsSync(localEnv)) {
  dotenv.config({ path: localEnv });
} else {
  dotenv.config();
}

// Ensure Prisma uses a reachable DATABASE_URL when running locally with Docker DB
(() => {
  const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, DB_HOST, DB_PORT } = process.env;
  const hasParts = POSTGRES_USER && POSTGRES_PASSWORD && POSTGRES_DB;

  if (!process.env.DATABASE_URL && hasParts) {
    const host = DB_HOST || 'localhost';
    const port = DB_PORT || '5432';
    const user = encodeURIComponent(POSTGRES_USER ?? 'postgres');
    const pass = encodeURIComponent(POSTGRES_PASSWORD ?? 'postgres');
    const db = POSTGRES_DB ?? 'postgres';
    process.env.DATABASE_URL = `postgresql://${user}:${pass}@${host}:${port}/${db}`;
  } else if (process.env.DATABASE_URL) {
    try {
      const url = new URL(process.env.DATABASE_URL);
      if (url.hostname === 'db') {
        url.hostname = DB_HOST || 'localhost';
        if (DB_PORT) url.port = DB_PORT;
        // Optionally remap credentials if provided
        if (POSTGRES_USER) url.username = POSTGRES_USER;
        if (POSTGRES_PASSWORD) url.password = POSTGRES_PASSWORD;
        process.env.DATABASE_URL = url.toString();
      }
    } catch {
      // ignore parse errors; leave DATABASE_URL as-is
    }
  }
})();

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
  // Clean up legacy non-UUID seeded IDs from previous runs
  const legacyBookingIds = ['booking-seaside-john', 'booking-cabin-jane'];
  await prisma.invoice.deleteMany({ where: { bookingId: { in: legacyBookingIds } } });
  await prisma.booking.deleteMany({ where: { id: { in: legacyBookingIds } } });
  const seaside = await prisma.property.findFirst({ where: { name: 'Seaside Villa' } });
  const cabin = await prisma.property.findFirst({ where: { name: 'Mountain Cabin' } });
  const john = await prisma.client.findUnique({ where: { email: 'john.doe@example.com' } });
  const jane = await prisma.client.findUnique({ where: { email: 'jane.smith@example.com' } });
  if (seaside && john) {
    await prisma.booking.upsert({
      where: { id: '11111111-1111-4111-8111-111111111111' },
      update: {},
      create: {
        id: '11111111-1111-4111-8111-111111111111',
        startDate: new Date(),
        endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        totalPrice: 1200,
        propertyId: seaside.id,
        clientId: john.id,
      },
    });
  }
  if (cabin && jane) {
    await prisma.booking.upsert({
      where: { id: '22222222-2222-4222-8222-222222222222' },
      update: {},
      create: {
        id: '22222222-2222-4222-8222-222222222222',
        startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10),
        endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 17),
        totalPrice: 800,
        propertyId: cabin.id,
        clientId: jane.id,
      },
    });
  }

  console.log('Seeding sample invoices...');
  const booking1 = await prisma.booking.findUnique({
    where: { id: '11111111-1111-4111-8111-111111111111' },
  });
  if (booking1) {
    await prisma.invoice.upsert({
      where: { invoiceNumber: 'INV-1000' },
      update: {},
      create: {
        invoiceNumber: 'INV-1000',
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        amount: 1200,
        bookingId: booking1.id,
      },
    });
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
