import { BadRequestException, ConflictException } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import type { Prisma } from '@prisma/client';

type BookingModel = {
  count: (args?: Prisma.BookingCountArgs) => Promise<number>;
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
  let mockPriceCalculator: any;
  let mockSettingsService: any;

  beforeEach(() => {
    const booking: jest.Mocked<BookingModel> = {
      count: jest.fn(),
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

    // Mock price calculator
    mockPriceCalculator = {
      calculate: jest.fn().mockReturnValue({
        basePrice: 500,
        linensPrice: 0,
        cleaningPrice: 0,
        discount: 0,
        insuranceFee: 0,
        touristTax: 10,
        totalPrice: 510,
      }),
    };

    // Mock settings service
    mockSettingsService = {
      getSettings: jest.fn().mockResolvedValue({
        lowSeasonRate: 750,
        highSeasonRate: 830,
        lowSeasonMonths: [1, 2, 3, 11, 12],
        linensOptionPrice: 20,
        cleaningOptionPrice: 35,
        cancellationInsurancePercentage: 6,
        touristTaxRatePerPersonPerDay: 1,
      }),
    };

    const prismaTyped = prisma as unknown as import('src/prisma/prisma.service').PrismaService;
    service = new BookingsService(prismaTyped, mockPriceCalculator, mockSettingsService);
  });

  it('findAll without range uses no where filter', async () => {
    prisma.booking.count.mockResolvedValue(0);
    prisma.booking.findMany.mockResolvedValue([]);
    const res = await service.findAll();
    expect(res).toEqual({ data: [], totalCount: 0 });
  });

  it('findAll with from and to calls prisma with where filter', async () => {
    prisma.booking.count.mockResolvedValue(0);
    prisma.booking.findMany.mockResolvedValue([]);
    const from = new Date('2025-01-01');
    const to = new Date('2025-01-10');
    await service.findAll({ from, to });
    expect(prisma.booking.count).toHaveBeenCalled();
    expect(prisma.booking.findMany).toHaveBeenCalled();
  });

  it('findAll with only from calls prisma with filter', async () => {
    prisma.booking.count.mockResolvedValue(0);
    prisma.booking.findMany.mockResolvedValue([]);
    const from = new Date('2025-02-01');
    await service.findAll({ from });
    expect(prisma.booking.count).toHaveBeenCalled();
    expect(prisma.booking.findMany).toHaveBeenCalled();
  });

  it('findAll with only to calls prisma with filter', async () => {
    prisma.booking.count.mockResolvedValue(0);
    prisma.booking.findMany.mockResolvedValue([]);
    const to = new Date('2025-02-10');
    await service.findAll({ to });
    expect(prisma.booking.count).toHaveBeenCalled();
    expect(prisma.booking.findMany).toHaveBeenCalled();
  });

  it('findAll with sort=oldest orders by startDate asc', async () => {
    prisma.booking.count.mockResolvedValue(0);
    prisma.booking.findMany.mockResolvedValue([]);
    await service.findAll(undefined, 'oldest');
    expect(prisma.booking.count).toHaveBeenCalled();
    expect(prisma.booking.findMany).toHaveBeenCalled();
  });

  it('findAll with sort=price-high orders by totalPrice desc', async () => {
    prisma.booking.count.mockResolvedValue(0);
    prisma.booking.findMany.mockResolvedValue([]);
    await service.findAll(undefined, 'price-high');
    expect(prisma.booking.count).toHaveBeenCalled();
    expect(prisma.booking.findMany).toHaveBeenCalled();
  });

  it('findAll with sort=price-low orders by totalPrice asc', async () => {
    prisma.booking.count.mockResolvedValue(0);
    prisma.booking.findMany.mockResolvedValue([]);
    await service.findAll(undefined, 'price-low');
    expect(prisma.booking.count).toHaveBeenCalled();
    expect(prisma.booking.findMany).toHaveBeenCalled();
  });

  it('findAll with sort=name orders by property name asc', async () => {
    prisma.booking.count.mockResolvedValue(0);
    prisma.booking.findMany.mockResolvedValue([]);
    await service.findAll(undefined, 'name');
    expect(prisma.booking.count).toHaveBeenCalled();
    expect(prisma.booking.findMany).toHaveBeenCalled();
  });

  it('create validates date order and price', async () => {
    await expect(
      service.create({
        // @ts-expect-error testing validation on missing dates
        startDate: undefined,
        // @ts-expect-error testing validation on missing dates
        endDate: undefined,
        propertyId: 'p1',
        clientId: 'c1',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.create({
        startDate: new Date('2025-01-10'),
        endDate: new Date('2025-01-05'),
        propertyId: 'p1',
        clientId: 'c1',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('create rejects NaN dates for start and end', async () => {
    const badStart = new Date('invalid');
    const badEnd = new Date('also invalid');
    await expect(
      service.create({
        startDate: badStart,
        endDate: new Date('2025-01-05'),
        propertyId: 'p1',
        clientId: 'c1',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.create({
        startDate: new Date('2025-01-01'),
        endDate: badEnd,
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
      propertyId: 'p1',
      clientId: 'c1',
    };
    await service.create(data);
    expect(prisma.booking.create).toHaveBeenCalled();
    expect(mockPriceCalculator.calculate).toHaveBeenCalled();
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

  it('update rejects NaN dates and non-positive total price', async () => {
    const current = {
      id: 'b1',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-03'),
      totalPrice: 100,
      propertyId: 'p1',
      clientId: 'c1',
    };
    prisma.booking.findUnique.mockResolvedValue(current);

    await expect(
      service.update('b1', {
        startDate: new Date('invalid'),
      } as unknown as import('./dto/update-booking.dto').UpdateBookingDto),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.update('b1', {
        endDate: new Date('invalid'),
      } as unknown as import('./dto/update-booking.dto').UpdateBookingDto),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.update('b1', {
        totalPrice: 0,
      } as unknown as import('./dto/update-booking.dto').UpdateBookingDto),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('delete removes invoices first within a transaction', async () => {
    prisma.invoice.deleteMany.mockResolvedValue({});
    prisma.booking.delete.mockResolvedValue({ id: 'b1' });
    await service.delete('b1');
    expect(prisma.invoice.deleteMany).toHaveBeenCalledWith({ where: { bookingId: 'b1' } });
    expect(prisma.booking.delete).toHaveBeenCalledWith({ where: { id: 'b1' } });
  });

  it('findOne returns booking with relations via prisma', async () => {
    prisma.booking.findUnique.mockResolvedValue({ id: 'b1' } as unknown as never);
    const res = await service.findOne('b1');
    expect(res).toEqual({ id: 'b1' });
    expect(prisma.booking.findUnique).toHaveBeenCalledWith({
      where: { id: 'b1' },
      include: { property: true, client: true, invoice: true },
    });
  });

  it('findOverlappingRange builds correct where when both dates provided', async () => {
    prisma.booking.findMany.mockResolvedValue([]);
    const start = new Date('2025-01-01');
    const end = new Date('2025-01-10');
    await service.findOverlappingRange({ start, end });
    expect(prisma.booking.findMany).toHaveBeenCalled();
  });

  it('findOverlappingRange without both dates uses no where filter', async () => {
    prisma.booking.findMany.mockResolvedValue([]);
    await service.findOverlappingRange({ start: new Date('2025-01-01') });
    expect(prisma.booking.findMany).toHaveBeenCalledWith({
      where: undefined,
      include: { property: true, client: true, invoice: true },
      orderBy: { startDate: 'asc' },
    });
  });

  it('findOverlappingRange with undefined range uses no filter', async () => {
    prisma.booking.findMany.mockResolvedValue([]);
    await service.findOverlappingRange();
    expect(prisma.booking.findMany).toHaveBeenCalledWith({
      where: undefined,
      include: { property: true, client: true, invoice: true },
      orderBy: { startDate: 'asc' },
    });
  });

  it('update throws when booking not found', async () => {
    prisma.booking.findUnique.mockResolvedValueOnce(null as unknown as never);
    await expect(
      service.update(
        'missing',
        {} as unknown as import('./dto/update-booking.dto').UpdateBookingDto,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('update rejects invalid status', async () => {
    const current = {
      id: 'b1',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-03'),
      totalPrice: 100,
      propertyId: 'p1',
      clientId: 'c1',
    };
    prisma.booking.findUnique.mockResolvedValue(current);
    await expect(
      service.update('b1', {
        status: 'nope',
      } as unknown as import('./dto/update-booking.dto').UpdateBookingDto),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('update succeeds with status and relation connects', async () => {
    const current = {
      id: 'b1',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-03'),
      totalPrice: 100,
      propertyId: 'p1',
      clientId: 'c1',
    };
    prisma.booking.findUnique.mockResolvedValue(current);
    prisma.booking.findFirst.mockResolvedValue(null);
    prisma.booking.update.mockResolvedValue({ id: 'b1' });
    await service.update('b1', {
      startDate: new Date('2025-01-02'),
      endDate: new Date('2025-01-05'),
      totalPrice: 200,
      status: 'confirmed',
      propertyId: 'p2',
      clientId: 'c2',
    } as unknown as import('./dto/update-booking.dto').UpdateBookingDto);
    const updateCalls = (prisma.booking.update as unknown as jest.Mock).mock.calls as Array<
      [{ where: { id: string }; data: Record<string, unknown> }]
    >;
    const args = updateCalls[0][0];
    expect(args.where).toEqual({ id: 'b1' });
    expect(args.data).toEqual(
      expect.objectContaining({
        startDate: new Date('2025-01-02'),
        endDate: new Date('2025-01-05'),
        totalPrice: 200,
        status: 'confirmed',
        property: { connect: { id: 'p2' } },
        client: { connect: { id: 'c2' } },
      }),
    );
  });

  it('update supports other valid statuses and avoids no-op connects', async () => {
    const current = {
      id: 'b1',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-03'),
      totalPrice: 100,
      propertyId: 'p1',
      clientId: 'c1',
    };
    prisma.booking.findUnique.mockResolvedValue(current);
    prisma.booking.findFirst.mockResolvedValue(null);
    prisma.booking.update.mockResolvedValue({ id: 'b1' });

    await service.update('b1', {
      // keep relations the same to avoid connect blocks
      startDate: new Date('2025-01-02'),
      endDate: new Date('2025-01-03'),
      totalPrice: 150,
      status: 'pending',
      propertyId: 'p1',
      clientId: 'c1',
    } as unknown as import('./dto/update-booking.dto').UpdateBookingDto);

    const updateCalls = (prisma.booking.update as unknown as jest.Mock).mock.calls as Array<
      [{ where: { id: string }; data: Record<string, unknown> }]
    >;
    const args = updateCalls.pop()?.[0] as { where: { id: string }; data: Record<string, unknown> };
    expect(args.data).toEqual(
      expect.objectContaining({
        status: 'pending',
        // no property/client connect when ids unchanged
      }),
    );
    expect('property' in args.data).toBe(false);
    expect('client' in args.data).toBe(false);

    // try another valid status
    await service.update('b1', {
      startDate: new Date('2025-01-02'),
      endDate: new Date('2025-01-03'),
      totalPrice: 150,
      status: 'blocked',
    } as unknown as import('./dto/update-booking.dto').UpdateBookingDto);
    const args2 = (
      (prisma.booking.update as unknown as jest.Mock).mock.calls as Array<
        [{ where: { id: string }; data: Record<string, unknown> }]
      >
    ).pop()?.[0].data as Record<string, unknown>;
    expect(args2.status).toBe('blocked');
  });
});
