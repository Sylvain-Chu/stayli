import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Booking } from '@prisma/client';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Booking[]> {
    return this.prisma.booking.findMany({ include: { property: true, client: true } });
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

  async findOne(id: string): Promise<Booking | null> {
    return this.prisma.booking.findUnique({
      where: { id },
      include: { property: true, client: true },
    });
  }

  async update(
    id: string,
    data: {
      startDate?: Date;
      endDate?: Date;
      totalPrice?: number;
      status?: string;
      propertyId?: string;
      clientId?: string;
    },
  ): Promise<Booking> {
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
        id: { not: id },
        AND: [{ startDate: { lt: endDate } }, { endDate: { gt: startDate } }],
      },
      select: { id: true },
    });
    if (overlap) {
      throw new ConflictException('Overlapping booking exists for this property.');
    }

    return this.prisma.booking.update({ where: { id }, data });
  }
}
