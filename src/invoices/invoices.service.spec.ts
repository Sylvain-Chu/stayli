import { InvoicesService } from './invoices.service';

type InvoiceModel = {
  findMany: jest.Mock<Promise<unknown[]>, [args?: unknown]>;
  create: jest.Mock<Promise<unknown>, [args: unknown]>;
  delete: jest.Mock<Promise<unknown>, [args: unknown]>;
  findUnique: jest.Mock<Promise<Record<string, unknown> | null>, [args: unknown]>;
  update: jest.Mock<Promise<unknown>, [args: unknown]>;
  count: jest.Mock<Promise<number>, [args?: unknown]>;
};

type BookingModel = {
  findMany: jest.Mock<Promise<unknown[]>, [args?: unknown]>;
};

type MockPrisma = {
  invoice: InvoiceModel;
  booking: BookingModel;
};

describe('InvoicesService', () => {
  let service: InvoicesService;
  let prisma: MockPrisma;

  beforeEach(() => {
    prisma = {
      invoice: {
        findMany: jest.fn<Promise<unknown[]>, [args?: unknown]>(),
        create: jest.fn<Promise<unknown>, [args: unknown]>(),
        delete: jest.fn<Promise<unknown>, [args: unknown]>(),
        findUnique: jest.fn<Promise<Record<string, unknown> | null>, [args: unknown]>(),
        update: jest.fn<Promise<unknown>, [args: unknown]>(),
        count: jest.fn<Promise<number>, [args?: unknown]>(),
      },
      booking: { findMany: jest.fn<Promise<unknown[]>, [args?: unknown]>() },
    };

    service = new InvoicesService(
      prisma as unknown as import('src/prisma/prisma.service').PrismaService,
    );
  });

  it('findAll includes booking', async () => {
    prisma.invoice.findMany.mockResolvedValueOnce([]);
    prisma.invoice.count.mockResolvedValueOnce(0);
    const res = await service.findAll();
    expect(res).toEqual({ invoices: [], total: 0 });
    expect(prisma.invoice.findMany).toHaveBeenCalled();
  });

  it('create connects booking and sets fields', async () => {
    prisma.invoice.create.mockResolvedValueOnce({ id: 'i1' });
    const now = new Date();
    const res = await service.create({ dueDate: now, amount: 123, bookingId: 'b1' });
    expect(prisma.invoice.create.mock.calls[0][0]).toEqual({
      data: {
        dueDate: now,
        amount: 123,
        booking: { connect: { id: 'b1' } },
      },
    });
    expect(res).toEqual({ id: 'i1' });
  });

  it('findEligibleBookings filters by missing invoice and includes relations', async () => {
    prisma.booking.findMany.mockResolvedValueOnce([{ id: 'b1' }]);
    const res = await service.findEligibleBookings();
    expect(prisma.booking.findMany).toHaveBeenCalledWith({
      where: { invoice: null },
      include: { property: true, client: true },
    });
    expect(res).toEqual([{ id: 'b1' }]);
  });

  it('delete forwards to prisma', async () => {
    prisma.invoice.delete.mockResolvedValueOnce({ id: 'i1' });
    const res = await service.delete('i1');
    expect(prisma.invoice.delete).toHaveBeenCalledWith({ where: { id: 'i1' } });
    expect(res).toEqual({ id: 'i1' });
  });

  it('findOne includes booking', async () => {
    prisma.invoice.findUnique.mockResolvedValueOnce({ id: 'i1' });
    const res = await service.findOne('i1');
    expect(prisma.invoice.findUnique).toHaveBeenCalledWith({
      where: { id: 'i1' },
      include: {
        booking: {
          include: {
            client: true,
            property: true,
          },
        },
      },
    });
    expect(res).toEqual({ id: 'i1' });
  });

  it('update supports relation connect and excludes bookingId scalar', async () => {
    prisma.invoice.update.mockResolvedValueOnce({ id: 'i1' });
    const res = await service.update('i1', {
      invoiceNumber: 'INV-1',
      amount: 200,
      bookingId: 'b2',
    });
    const call = prisma.invoice.update.mock.calls[0][0] as { data: Record<string, unknown> };
    expect(call).toMatchObject({ where: { id: 'i1' } });
    expect(call.data).toMatchObject({
      invoiceNumber: 'INV-1',
      amount: 200,
      booking: { connect: { id: 'b2' } },
    });
    // Ensure bookingId scalar is not present
    expect('bookingId' in call.data).toBe(false);
    expect(res).toEqual({ id: 'i1' });
  });
});
