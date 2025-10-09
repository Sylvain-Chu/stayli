import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Invoice } from '@prisma/client';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Invoice[]> {
    return this.prisma.invoice.findMany({ include: { booking: true } });
  }

  async create(data: {
    invoiceNumber: string;
    dueDate: Date;
    amount: number;
    bookingId: string;
  }): Promise<Invoice> {
    return this.prisma.invoice.create({ data });
  }

  // List bookings that do not yet have an invoice (for the create form)
  async findEligibleBookings() {
    return this.prisma.booking.findMany({
      where: { invoice: null },
      include: { property: true, client: true },
    });
  }

  async delete(id: string): Promise<Invoice> {
    return this.prisma.invoice.delete({ where: { id } });
  }

  async findOne(id: string): Promise<Invoice | null> {
    return this.prisma.invoice.findUnique({ where: { id }, include: { booking: true } });
  }

  async update(
    id: string,
    data: {
      invoiceNumber?: string;
      dueDate?: Date;
      amount?: number;
      status?: string;
      bookingId?: string;
    },
  ): Promise<Invoice> {
    return this.prisma.invoice.update({ where: { id }, data });
  }
}
