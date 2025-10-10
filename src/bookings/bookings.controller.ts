import {
  Controller,
  Get,
  Render,
  InternalServerErrorException,
  Post,
  Body,
  Redirect,
  Param,
  Delete,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Prisma } from '@prisma/client';
import { HttpException, Query } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { InvoicesService } from 'src/invoices/invoices.service';

const INVOICE_DUE_DAYS = 14;

@Controller('bookings')
export class BookingsController {
  constructor(
    private readonly bookingsService: BookingsService,
    private readonly prisma: PrismaService,
    private readonly invoicesService: InvoicesService,
  ) {}

  @Get()
  @Render('bookings/index')
  async index() {
    try {
      const bookings = await this.bookingsService.findAll();
      return { bookings };
    } catch {
      throw new InternalServerErrorException('Failed to retrieve bookings.');
    }
  }

  @Get('calendar')
  @Render('bookings/calendar')
  calendar() {
    return {};
  }

  @Get('events')
  async events(
    @Query('start') start?: string,
    @Query('end') end?: string,
    @Query('status') status?: string | string[],
  ) {
    const startDate = start ? new Date(start) : undefined;
    const endDate = end ? new Date(end) : undefined;

    // Normalize and validate statuses
    const allowed = new Set(['confirmed', 'pending', 'cancelled', 'blocked']);
    const rawStatuses = Array.isArray(status) ? status : status ? [status] : [];
    const statuses = rawStatuses.filter((s) => allowed.has(String(s)));

    // Fetch bookings; service handles overlap filter; we'll filter by status here if provided
    let bookings = await this.bookingsService.findOverlappingRange({
      start: startDate,
      end: endDate,
    });
    if (statuses.length > 0) {
      bookings = bookings.filter((b) => statuses.includes(String(b.status)));
    }

    const colors: Record<
      string,
      { backgroundColor: string; borderColor: string; textColor?: string }
    > = {
      confirmed: { backgroundColor: '#16a34a', borderColor: '#15803d', textColor: '#ffffff' },
      pending: { backgroundColor: '#f59e0b', borderColor: '#d97706', textColor: '#111827' },
      cancelled: { backgroundColor: '#dc2626', borderColor: '#b91c1c', textColor: '#ffffff' },
      blocked: { backgroundColor: '#6b7280', borderColor: '#4b5563', textColor: '#ffffff' },
    };

    // Map to FullCalendar event format
    return bookings.map((b) => ({
      id: b.id,
      title: `${b.property.name} — ${b.client.firstName} ${b.client.lastName}`,
      start: b.startDate,
      end: b.endDate,
      ...(colors[String(b.status)] ?? {}),
      extendedProps: {
        totalPrice: b.totalPrice,
        status: b.status,
        propertyId: b.propertyId,
        clientId: b.clientId,
      },
      url: `/bookings/${b.id}`,
    }));
  }

  @Get('create')
  @Render('bookings/create')
  async createForm() {
    const [properties, clients] = await Promise.all([
      this.prisma.property.findMany({ orderBy: { name: 'asc' } }),
      this.prisma.client.findMany({ orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }] }),
    ]);
    return { properties, clients };
  }

  @Post('create')
  @Redirect('/bookings')
  async create(@Body() body: CreateBookingDto) {
    try {
      await this.bookingsService.create(body);
      return;
    } catch (err: unknown) {
      if (err instanceof HttpException) {
        throw err;
      }
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2003') {
          // FK constraint
          throw new BadRequestException('Invalid property or client.');
        }
      }
      throw new InternalServerErrorException('Error creating booking.');
    }
  }

  @Delete(':id/delete')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    try {
      await this.bookingsService.delete(id);
    } catch (err: unknown) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2025') {
          throw new BadRequestException('Booking not found.');
        }
      }
      throw new InternalServerErrorException('Error deleting booking.');
    }
  }

  @Get(':id')
  @Render('bookings/show')
  async show(@Param('id') id: string) {
    const booking = await this.bookingsService.findOne(id);
    if (!booking) {
      throw new InternalServerErrorException('Booking not found');
    }
    return { booking };
  }

  @Get(':id/edit')
  @Render('bookings/edit')
  async editForm(@Param('id') id: string) {
    const [booking, properties, clients] = await Promise.all([
      this.bookingsService.findOne(id),
      this.prisma.property.findMany({ orderBy: { name: 'asc' } }),
      this.prisma.client.findMany({ orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }] }),
    ]);
    if (!booking) {
      throw new InternalServerErrorException('Booking not found');
    }
    return { booking, properties, clients };
  }

  @Post(':id/edit')
  @Redirect('/bookings')
  async update(@Param('id') id: string, @Body() body: UpdateBookingDto) {
    try {
      await this.bookingsService.update(id, body);
      return;
    } catch (err: unknown) {
      if (err instanceof HttpException) {
        throw err;
      }
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2025') {
          throw new BadRequestException('Booking not found.');
        }
        if (err.code === 'P2003') {
          throw new BadRequestException('Invalid property or client.');
        }
      }
      throw new InternalServerErrorException('Error updating booking.');
    }
  }

  @Post(':id/cancel')
  @Redirect('/bookings')
  async cancel(@Param('id') id: string) {
    try {
      await this.bookingsService.update(id, { status: 'cancelled' } as unknown as UpdateBookingDto);
      return;
    } catch (err: unknown) {
      if (err instanceof HttpException) {
        throw err;
      }
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2025') {
          throw new BadRequestException('Booking not found.');
        }
      }
      throw new InternalServerErrorException('Error cancelling booking.');
    }
  }

  @Post(':id/invoice')
  @Redirect()
  async generateInvoice(@Param('id') bookingId: string) {
    try {
      // Ensure booking exists and whether it already has an invoice
      const booking = await this.bookingsService.findOne(bookingId);
      if (!booking) {
        throw new BadRequestException('Booking not found.');
      }
      if (booking.invoice) {
        throw new BadRequestException('An invoice already exists for this booking.');
      }
      // Amount and due date defaults: amount = booking.totalPrice, due in INVOICE_DUE_DAYS days
      const today = new Date();
      const amount = booking.totalPrice;
      if (amount == null) {
        throw new BadRequestException('Missing booking total price.');
      }

      if (amount <= 0) {
        throw new BadRequestException('Booking total price must be greater than zero.');
      }
      const dueDate = new Date(today);
      dueDate.setDate(dueDate.getDate() + INVOICE_DUE_DAYS);

      const inv = await this.invoicesService.create({ dueDate, amount, bookingId });
      return { url: `/invoices/${inv.id}` };
    } catch (err: unknown) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2003') {
          throw new BadRequestException('Invalid booking.');
        }
      }
      if (err instanceof BadRequestException) {
        throw err;
      }
      throw new InternalServerErrorException('Error generating invoice.');
    }
  }
}
