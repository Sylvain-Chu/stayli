import { Injectable } from '@nestjs/common';
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
    },
  ): Promise<Booking> {
    return this.prisma.booking.update({ where: { id }, data });
  }
}
