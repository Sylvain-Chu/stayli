import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Booking, Client, Property, Prisma, Invoice } from '@prisma/client';
import { UpdateBookingDto } from './dto/update-booking.dto';

export type BookingWithRelations = Booking & {
  property: Property;
  client: Client;
  invoice: Invoice | null;
};
type DateRange = { start?: Date; end?: Date };

// Narrow and validate booking status without referencing enum static members (avoids ESLint unsafe-member-access)
function isValidBookingStatus(s: unknown): s is 'confirmed' | 'pending' | 'cancelled' | 'blocked' {
  return (
    typeof s === 'string' &&
    (s === 'confirmed' || s === 'pending' || s === 'cancelled' || s === 'blocked')
  );
}

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async findAll(range?: { from?: Date; to?: Date }): Promise<BookingWithRelations[]> {
    const from = range?.from;
    const to = range?.to;
    const where: Prisma.BookingWhereInput | undefined =
      from || to
        ? {
            AND: [
              ...(from ? [{ endDate: { gte: from } }] : []),
              ...(to ? [{ startDate: { lte: to } }] : []),
            ],
          }
        : undefined;
    return this.prisma.booking.findMany({
      where,
      include: { property: true, client: true, invoice: true },
      orderBy: { startDate: 'asc' },
    });
  }

  async findOverlappingRange(range?: DateRange): Promise<BookingWithRelations[]> {
    const { start, end } = range ?? {};
    const where =
      start && end
        ? {
            AND: [{ startDate: { lt: end } }, { endDate: { gt: start } }],
          }
        : undefined;

    return this.prisma.booking.findMany({
      where,
      include: { property: true, client: true, invoice: true },
      orderBy: { startDate: 'asc' },
    });
  }

  async create(data: {
    startDate: Date;
    endDate: Date;
    totalPrice: number;
    propertyId: string;
    clientId: string;
  }): Promise<Booking> {
    // Basic validations
    if (!data.startDate || !data.endDate) {
      throw new BadRequestException('Start and end dates are required.');
    }
    if (!(data.startDate instanceof Date) || Number.isNaN(data.startDate.getTime())) {
      throw new BadRequestException('Invalid start date.');
    }
    if (!(data.endDate instanceof Date) || Number.isNaN(data.endDate.getTime())) {
      throw new BadRequestException('Invalid end date.');
    }
    if (data.endDate <= data.startDate) {
      throw new BadRequestException('End date must be after start date.');
    }
    if (data.totalPrice == null || data.totalPrice <= 0) {
      throw new BadRequestException('Total price must be greater than 0.');
    }

    // Prevent overlapping bookings on the same property
    const overlap = await this.prisma.booking.findFirst({
      where: {
        propertyId: data.propertyId,
        status: { not: 'cancelled' },
        AND: [{ startDate: { lt: data.endDate } }, { endDate: { gt: data.startDate } }],
      },
      select: { id: true },
    });
    if (overlap) {
      throw new ConflictException('Overlapping booking exists for this property.');
    }

    return this.prisma.booking.create({ data });
  }

  async delete(id: string): Promise<Booking> {
    // delete dependent invoices first to avoid foreign key constraint errors
    return await this.prisma.$transaction(async (tx) => {
      await tx.invoice.deleteMany({ where: { bookingId: id } });
      return tx.booking.delete({ where: { id } });
    });
  }

  async findOne(id: string): Promise<BookingWithRelations | null> {
    return this.prisma.booking.findUnique({
      where: { id },
      include: { property: true, client: true, invoice: true },
    });
  }

  async update(id: string, data: UpdateBookingDto): Promise<Booking> {
    // Fetch current booking to have base values for validation
    const current = await this.prisma.booking.findUnique({ where: { id } });
    if (!current) {
      throw new BadRequestException('Booking not found.');
    }

    const startDate = data.startDate ?? current.startDate;
    const endDate = data.endDate ?? current.endDate;
    const propertyId = data.propertyId ?? current.propertyId;
    const totalPrice = data.totalPrice ?? current.totalPrice;

    if (!(startDate instanceof Date) || Number.isNaN(startDate.getTime())) {
      throw new BadRequestException('Invalid start date.');
    }
    if (!(endDate instanceof Date) || Number.isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid end date.');
    }
    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date.');
    }
    if (totalPrice == null || totalPrice <= 0) {
      throw new BadRequestException('Total price must be greater than 0.');
    }

    // Overlap check, excluding this booking id
    const overlap = await this.prisma.booking.findFirst({
      where: {
        propertyId,
        status: { not: 'cancelled' },
        id: { not: id },
        AND: [{ startDate: { lt: endDate } }, { endDate: { gt: startDate } }],
      },
      select: { id: true },
    });
    if (overlap) {
      throw new ConflictException('Overlapping booking exists for this property.');
    }

    // Build Prisma-compliant update payload
    const updateData: Prisma.BookingUpdateInput = {
      startDate,
      endDate,
      totalPrice,
    };

    if (typeof data.status !== 'undefined') {
      if (!isValidBookingStatus(data.status)) {
        throw new BadRequestException('Invalid status.');
      }
      updateData.status = data.status;
    }

    if (data.propertyId && data.propertyId !== current.propertyId) {
      updateData.property = { connect: { id: data.propertyId } };
    }
    if (data.clientId && data.clientId !== current.clientId) {
      updateData.client = { connect: { id: data.clientId } };
    }

    return this.prisma.booking.update({ where: { id }, data: updateData });
  }
}
