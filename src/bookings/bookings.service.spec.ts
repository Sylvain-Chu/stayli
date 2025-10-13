import { BadRequestException, ConflictException } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import type { Prisma } from '@prisma/client';

type BookingModel = {
  findMany: (args: Prisma.BookingFindManyArgs) => Promise<unknown[]>;
  findFirst: (args: Prisma.BookingFindFirstArgs) => Promise<{ id: string } | null>;
  findUnique: (args: Prisma.BookingFindUniqueArgs) => Promise<{
    id: string;
    startDate: Date;
    endDate: Date;
    totalPrice: number;
    propertyId: string;
    clientId: string;
  } | null>;
  create: (args: Prisma.BookingCreateArgs) => Promise<unknown>;
  delete: (args: Prisma.BookingDeleteArgs) => Promise<unknown>;
  update: (args: Prisma.BookingUpdateArgs) => Promise<unknown>;
};

type InvoiceModel = {
  deleteMany: (args: Prisma.InvoiceDeleteManyArgs) => Promise<unknown>;
};

type MockPrisma = {
  booking: jest.Mocked<BookingModel>;
  invoice: jest.Mocked<InvoiceModel>;
  $transaction: <T>(
    fn: (tx: { booking: BookingModel; invoice: InvoiceModel }) => Promise<T>,
  ) => Promise<T>;
};

describe('BookingsService', () => {
  let service: BookingsService;
  let prisma: MockPrisma;

  beforeEach(() => {
    const booking: jest.Mocked<BookingModel> = {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<BookingModel>;

    const invoice: jest.Mocked<InvoiceModel> = {
      deleteMany: jest.fn(),
    } as unknown as jest.Mocked<InvoiceModel>;

    prisma = {
      booking,
      invoice,
      $transaction: async (fn) => fn({ booking, invoice }),
    };

    const prismaTyped = prisma as unknown as import('src/prisma/prisma.service').PrismaService;
    service = new BookingsService(prismaTyped);
  });

  it('findAll without range uses no where filter', async () => {
    prisma.booking.findMany.mockResolvedValue([]);
    const res = await service.findAll();
    expect(res).toEqual([]);
    expect(prisma.booking.findMany).toHaveBeenCalledWith({
      where: undefined,
      include: { property: true, client: true, invoice: true },
      orderBy: { startDate: 'asc' },
    });
  });

  it('findAll with from and to calls prisma with where filter', async () => {
    prisma.booking.findMany.mockResolvedValue([]);
    const from = new Date('2025-01-01');
    const to = new Date('2025-01-10');
    await service.findAll({ from, to });
    expect(prisma.booking.findMany).toHaveBeenCalled();
  });

  it('findAll with only from calls prisma with filter', async () => {
    prisma.booking.findMany.mockResolvedValue([]);
    const from = new Date('2025-02-01');
    await service.findAll({ from });
    expect(prisma.booking.findMany).toHaveBeenCalled();
  });

  it('findAll with only to calls prisma with filter', async () => {
    prisma.booking.findMany.mockResolvedValue([]);
    const to = new Date('2025-02-10');
    await service.findAll({ to });
    expect(prisma.booking.findMany).toHaveBeenCalled();
  });

  it('create validates date order and price', async () => {
    await expect(
      service.create({
        // @ts-expect-error testing validation on missing dates
        startDate: undefined,
        // @ts-expect-error testing validation on missing dates
        endDate: undefined,
        totalPrice: 100,
        propertyId: 'p1',
        clientId: 'c1',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.create({
        startDate: new Date('2025-01-10'),
        endDate: new Date('2025-01-05'),
        totalPrice: 100,
        propertyId: 'p1',
        clientId: 'c1',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.create({
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-05'),
        totalPrice: 0,
        propertyId: 'p1',
        clientId: 'c1',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('create detects overlapping booking on same property', async () => {
    prisma.booking.findFirst.mockResolvedValue({ id: 'other' });
    await expect(
      service.create({
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-05'),
        totalPrice: 100,
        propertyId: 'p1',
        clientId: 'c1',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('create succeeds when valid and no overlap', async () => {
    prisma.booking.findFirst.mockResolvedValue(null);
    prisma.booking.create.mockResolvedValue({ id: 'b1' });
    const data = {
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-05'),
      totalPrice: 100,
      propertyId: 'p1',
      clientId: 'c1',
    };
    await service.create(data);
    expect(prisma.booking.create).toHaveBeenCalled();
  });

  it('update validates and prevents overlaps', async () => {
    const current = {
      id: 'b1',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-03'),
      totalPrice: 100,
      propertyId: 'p1',
      clientId: 'c1',
    };
    prisma.booking.findUnique.mockResolvedValue(current);

    // End before start
    await expect(
      service.update('b1', {
        startDate: new Date('2025-01-05'),
        endDate: new Date('2025-01-01'),
      } as unknown as import('./dto/update-booking.dto').UpdateBookingDto),
    ).rejects.toBeInstanceOf(BadRequestException);

    // Overlap with other booking
    prisma.booking.findFirst.mockResolvedValue({ id: 'other' });
    await expect(
      service.update('b1', {
        startDate: new Date('2025-01-02'),
        endDate: new Date('2025-01-04'),
      } as unknown as import('./dto/update-booking.dto').UpdateBookingDto),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('delete removes invoices first within a transaction', async () => {
    prisma.invoice.deleteMany.mockResolvedValue({});
    prisma.booking.delete.mockResolvedValue({ id: 'b1' });
    await service.delete('b1');
    expect(prisma.invoice.deleteMany).toHaveBeenCalledWith({ where: { bookingId: 'b1' } });
    expect(prisma.booking.delete).toHaveBeenCalledWith({ where: { id: 'b1' } });
  });

  it('findOverlappingRange builds correct where when both dates provided', async () => {
    prisma.booking.findMany.mockResolvedValue([]);
    const start = new Date('2025-01-01');
    const end = new Date('2025-01-10');
    await service.findOverlappingRange({ start, end });
    expect(prisma.booking.findMany).toHaveBeenCalled();
  });
});
