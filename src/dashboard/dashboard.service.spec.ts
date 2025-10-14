import { DashboardService } from './dashboard.service';
import type { Prisma } from '@prisma/client';

type DashboardBooking = {
  id: string;
  startDate: Date;
  endDate: Date;
  status: string;
  client: { firstName: string; lastName: string; _count?: { bookings: number } };
  property: { name: string };
  totalPrice?: number;
};
type RevenueBooking = { totalPrice: number };

type MockPrisma = {
  property: { count: jest.Mock<Promise<number>, [args?: Prisma.PropertyCountArgs]> };
  client: { count: jest.Mock<Promise<number>, [args?: Prisma.ClientCountArgs]> };
  invoice: { count: jest.Mock<Promise<number>, [args?: Prisma.InvoiceCountArgs]> };
  booking: {
    findMany: jest.Mock<
      Promise<Array<DashboardBooking | RevenueBooking>>,
      [args?: Prisma.BookingFindManyArgs]
    >;
  };
};

describe('DashboardService', () => {
  let service: DashboardService;
  let prisma: MockPrisma;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-15T00:00:00Z'));
    prisma = {
      property: { count: jest.fn<Promise<number>, [args?: Prisma.PropertyCountArgs]>() },
      client: { count: jest.fn<Promise<number>, [args?: Prisma.ClientCountArgs]>() },
      invoice: { count: jest.fn<Promise<number>, [args?: Prisma.InvoiceCountArgs]>() },
      booking: {
        findMany: jest.fn<
          Promise<Array<DashboardBooking | RevenueBooking>>,
          [args?: Prisma.BookingFindManyArgs]
        >(),
      },
    };
    service = new DashboardService(
      prisma as unknown as import('src/prisma/prisma.service').PrismaService,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('getDashboardData returns composed data for week scope', async () => {
    // 1) current stays
    prisma.booking.findMany.mockResolvedValueOnce([
      {
        id: 'cs1',
        startDate: new Date('2025-01-15'),
        endDate: new Date('2025-01-20'),
        status: 'confirmed',
        client: { firstName: 'A', lastName: 'B', _count: { bookings: 2 } },
        property: { name: 'Villa' },
      },
    ]);
    // 2) arrivals
    prisma.booking.findMany.mockResolvedValueOnce([
      {
        id: 'a1',
        startDate: new Date('2025-01-15'),
        endDate: new Date('2025-01-16'),
        status: 'confirmed',
        client: { firstName: 'C', lastName: 'D', _count: { bookings: 1 } },
        property: { name: 'Flat' },
      },
    ]);
    // 3) departures
    prisma.booking.findMany.mockResolvedValueOnce([
      {
        id: 'd1',
        startDate: new Date('2025-01-10'),
        endDate: new Date('2025-01-15'),
        status: 'confirmed',
        client: { firstName: 'E', lastName: 'F', _count: { bookings: 3 } },
        property: { name: 'House' },
      },
    ]);
    // 4) calendar occupancy
    prisma.booking.findMany.mockResolvedValueOnce([
      {
        id: 'b1',
        startDate: new Date('2025-01-10'),
        endDate: new Date('2025-01-12'),
        status: 'confirmed',
        client: { firstName: 'G', lastName: 'H' },
        property: { name: 'Cottage' },
      },
    ]);

    // stats deps
    prisma.property.count.mockResolvedValueOnce(10);
    prisma.client.count.mockResolvedValueOnce(5);
    // monthly bookings for revenue calculation
    prisma.booking.findMany.mockResolvedValueOnce([{ totalPrice: 100 }, { totalPrice: 200 }]);
    prisma.invoice.count.mockResolvedValueOnce(2);

    const res = await service.getDashboardData('week');
    expect(res.scope).toBe('week');
    expect(res.currentStays.length).toBe(1);
    expect(res.arrivals.length).toBe(1);
    expect(res.departures.length).toBe(1);
    // Calendar days should include 10 and 11 occupied
    const days = res.calendar.days.filter(
      (d) => d.date === '2025-01-10' || d.date === '2025-01-11',
    );
    expect(days.every((d) => d.occupied)).toBe(true);
    // Stats computed
    expect(res.stats).toMatchObject({
      propertiesCount: 10,
      clientsCount: 5,
      revenueThisMonth: 300,
      pendingInvoices: 2,
      currentlyOccupiedProperties: 1,
      occupancyPercent: 10,
      revenueGoal: 3000,
    });
  });
});
