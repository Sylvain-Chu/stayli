import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardData(scope: 'week' | 'month' = 'week') {
    const [currentStays, arrivals, departures, calendar] = await Promise.all([
      this.getCurrentStays(),
      this.getArrivals(scope),
      this.getDepartures(scope),
      this.getCalendarOccupancy(),
    ]);

    const stats = await this.getStats(currentStays.length);

    return { stats, arrivals, departures, currentStays, calendar, scope };
  }

  // --- PRIVATE METHODS ---

  private async getStats(currentlyOccupiedProperties: number) {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1); // exclusive

    const [propertiesCount, clientsCount, monthlyBookings, pendingInvoices] = await Promise.all([
      this.prisma.property.count(),
      this.prisma.client.count(),
      this.prisma.booking.findMany({
        where: {
          status: 'confirmed',
          startDate: { lt: endOfMonth },
          endDate: { gt: startOfMonth },
        },
        select: { totalPrice: true },
      }),
      this.prisma.invoice.count({ where: { status: { not: 'paid' } } }),
    ]);

    const revenueThisMonth = monthlyBookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
    const occupancyPercent =
      propertiesCount > 0 ? Math.round((currentlyOccupiedProperties / propertiesCount) * 100) : 0;
    const revenueGoal = 3000; // You can make this configurable later
    const revenueProgressPercent =
      revenueGoal > 0 ? Math.min(100, Math.round((revenueThisMonth / revenueGoal) * 100)) : 0;

    return {
      propertiesCount,
      clientsCount,
      revenueThisMonth,
      pendingInvoices,
      currentlyOccupiedProperties,
      occupancyPercent,
      revenueGoal,
      revenueProgressPercent,
    };
  }

  private async getArrivals(scope: 'week' | 'month') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + (scope === 'week' ? 7 : 30));

    const bookings = await this.prisma.booking.findMany({
      where: {
        startDate: { gte: today, lte: futureDate },
        status: 'confirmed',
      },
      include: {
        client: { include: { _count: { select: { bookings: true } } } },
        property: true,
      },
      orderBy: { startDate: 'asc' },
    });

    return bookings.map((b) => ({
      ...b,
      isToday: this.isSameDay(b.startDate, today),
      clientStatus: b.client._count.bookings > 1 ? 'regular' : 'new',
    }));
  }

  private async getDepartures(scope: 'week' | 'month') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - (scope === 'week' ? 7 : 30));

    const bookings = await this.prisma.booking.findMany({
      where: {
        endDate: { gte: pastDate, lte: today },
        status: 'confirmed',
      },
      include: {
        client: { include: { _count: { select: { bookings: true } } } },
        property: true,
      },
      orderBy: { endDate: 'desc' },
    });

    return bookings.map((b) => ({
      ...b,
      isToday: this.isSameDay(b.endDate, today),
      clientStatus: b.client._count.bookings > 1 ? 'regular' : 'new',
    }));
  }

  private async getCurrentStays() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const bookings = await this.prisma.booking.findMany({
      where: {
        startDate: { lte: today },
        endDate: { gt: today },
        status: 'confirmed',
      },
      include: {
        client: { include: { _count: { select: { bookings: true } } } },
        property: true,
      },
    });

    return bookings.map((b) => ({
      ...b,
      isToday: this.isSameDay(b.startDate, today), // Highlight if they arrived today
      clientStatus: b.client._count.bookings > 1 ? 'regular' : 'new',
    }));
  }

  private async getCalendarOccupancy() {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1); // exclusive

    const bookings = await this.prisma.booking.findMany({
      where: {
        status: 'confirmed',
        startDate: { lte: endOfMonth },
        endDate: { gte: startOfMonth },
      },
      include: { client: true, property: true },
    });

    const occupiedDays = new Set<string>();
    const infoMap: Record<
      string,
      Array<{ client: string; property: string; start: string; end: string }>
    > = {};
    for (const booking of bookings) {
      // clamp to month and iterate nights [start, end)
      const start = new Date(
        Math.max(new Date(booking.startDate).getTime(), startOfMonth.getTime()),
      );
      const end = new Date(Math.min(new Date(booking.endDate).getTime(), endOfMonth.getTime()));
      for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const key = `${y}-${m}-${day}`;
        occupiedDays.add(key);
        if (!infoMap[key]) infoMap[key] = [];
        if (infoMap[key].length < 6) {
          const bs = new Date(booking.startDate);
          const be = new Date(booking.endDate);
          const fmt = (dt: Date) =>
            `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(
              dt.getDate(),
            ).padStart(2, '0')}`;
          infoMap[key].push({
            client: `${booking.client.firstName} ${booking.client.lastName}`,
            property: booking.property.name,
            start: fmt(bs),
            end: fmt(be),
          });
        }
      }
    }

    const daysInMonth: Array<{
      isBlank?: boolean;
      day?: number;
      occupied?: boolean;
      isToday?: boolean;
      date?: string;
      info?: string;
    }> = [];
    const firstDayOfMonth = startOfMonth.getDay(); // 0=Sun, 1=Mon, ...
    const leadingBlanks = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Monday is 0

    for (let i = 0; i < leadingBlanks; i++) {
      daysInMonth.push({ isBlank: true });
    }

    const lastDay = new Date(endOfMonth.getTime() - 1).getDate();
    for (let i = 1; i <= lastDay; i++) {
      const date = new Date(today.getFullYear(), today.getMonth(), i);
      const ymd = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
        date.getDate(),
      ).padStart(2, '0')}`;
      const items = infoMap[ymd] || [];
      const infoText = items
        .map((it) => `${it.client} — ${it.property} (du ${it.start} au ${it.end})`)
        .join('\n');
      daysInMonth.push({
        day: i,
        date: ymd,
        occupied: occupiedDays.has(ymd),
        isToday: this.isSameDay(date, today),
        info: infoText,
      });
    }

    return {
      monthLabel: today.toLocaleString('fr-FR', { month: 'long', year: 'numeric' }),
      days: daysInMonth,
    };
  }

  private isSameDay(d1: Date, d2: Date): boolean {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }
}
