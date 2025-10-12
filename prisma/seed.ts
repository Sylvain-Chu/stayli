import { PrismaClient } from '@prisma/client';
import { existsSync } from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';
import bcrypt from 'bcrypt';
const bcryptHash = bcrypt.hash;

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
  // Seed admin user if credentials provided
  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (ADMIN_EMAIL && ADMIN_PASSWORD) {
    console.log('Seeding admin user...');
  const passwordHash: string = await bcryptHash(ADMIN_PASSWORD, 12);
    // Narrowly type the prisma.user model without using any
    type Role = 'ADMIN' | 'USER';
    type UserModel = {
      upsert: (args: {
        where: { email: string };
        update: { passwordHash: string; role: Role };
        create: { email: string; passwordHash: string; role: Role };
      }) => Promise<unknown>;
    };
    const userModel = (prisma as unknown as { user: UserModel }).user;
    await userModel.upsert({
      where: { email: ADMIN_EMAIL },
      update: { passwordHash, role: 'ADMIN' },
      create: { email: ADMIN_EMAIL, passwordHash, role: 'ADMIN' },
    });
  }
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
  function daysFromNow(days: number) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d;
  }

  if (seaside && john) {
    await prisma.booking.upsert({
      where: { id: '11111111-1111-4111-8111-111111111111' },
      update: {},
      create: {
        id: '11111111-1111-4111-8111-111111111111',
        startDate: daysFromNow(0),
        endDate: daysFromNow(7),
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
        startDate: daysFromNow(10),
        endDate: daysFromNow(17),
        totalPrice: 800,
        propertyId: cabin.id,
        clientId: jane.id,
      },
    });
  }

  // Additional bookings to populate dashboard lists
  const flat = await prisma.property.findFirst({ where: { name: 'City Flat' } });
  if (flat && john) {
    // Upcoming arrival within 7 days
    await prisma.booking.upsert({
      where: { id: '33333333-3333-4333-8333-333333333333' },
      update: {},
      create: {
        id: '33333333-3333-4333-8333-333333333333',
        startDate: daysFromNow(3),
        endDate: daysFromNow(8),
        totalPrice: 600,
        propertyId: flat.id,
        clientId: john.id,
      },
    });
  }
  if (seaside && jane) {
    // Recent departure (ended yesterday)
    await prisma.booking.upsert({
      where: { id: '44444444-4444-4444-8444-444444444444' },
      update: {},
      create: {
        id: '44444444-4444-4444-8444-444444444444',
        startDate: daysFromNow(-6),
        endDate: daysFromNow(-1),
        totalPrice: 500,
        propertyId: seaside.id,
        clientId: jane.id,
      },
    });
  }
  if (cabin && john) {
    // Cancelled booking (should not show in lists)
    await prisma.booking.upsert({
      where: { id: '55555555-5555-4555-8555-555555555555' },
      update: { status: 'cancelled' as never },
      create: {
        id: '55555555-5555-4555-8555-555555555555',
        startDate: daysFromNow(2),
        endDate: daysFromNow(4),
        totalPrice: 300,
        status: 'cancelled' as never,
        propertyId: cabin.id,
        clientId: john.id,
      },
    });
  }

  console.log('Seeding sample invoices...');
  const booking1 = await prisma.booking.findUnique({
    where: { id: '11111111-1111-4111-8111-111111111111' },
  });
  const booking2 = await prisma.booking.findUnique({
    where: { id: '22222222-2222-4222-8222-222222222222' },
  });
  // intentionally no invoice for booking3 to keep it eligible
  const booking4 = await prisma.booking.findUnique({
    where: { id: '44444444-4444-4444-8444-444444444444' },
  });

  // For booking1 (current stay): ensure an invoice exists and is paid
  if (booking1) {
    await prisma.invoice.upsert({
      where: { bookingId: booking1.id },
      update: { amount: 1200, dueDate: daysFromNow(30), status: 'paid' },
      create: { dueDate: daysFromNow(30), amount: 1200, status: 'paid', bookingId: booking1.id },
    });
  }
  // For booking2 (future > 7 days): invoice in draft to count as pending
  if (booking2) {
    await prisma.invoice.upsert({
      where: { bookingId: booking2.id },
      update: { amount: 800, dueDate: daysFromNow(40), status: 'draft' },
      create: { dueDate: daysFromNow(40), amount: 800, status: 'draft', bookingId: booking2.id },
    });
  }
  // For booking3 (upcoming within 7 days): no invoice yet (eligible)
  // For booking4 (recent departure): paid invoice
  if (booking4) {
    await prisma.invoice.upsert({
      where: { bookingId: booking4.id },
      update: { amount: 500, dueDate: daysFromNow(10), status: 'paid' },
      create: { dueDate: daysFromNow(10), amount: 500, status: 'paid', bookingId: booking4.id },
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
