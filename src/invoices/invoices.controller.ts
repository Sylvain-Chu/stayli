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
  BadRequestException,
  HttpCode,
} from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('invoices')
export class InvoicesController {
  constructor(
    private readonly invoicesService: InvoicesService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @Render('invoices/index')
  async index() {
    try {
      const invoices = await this.invoicesService.findAll();
      return { invoices };
    } catch {
      throw new InternalServerErrorException('Failed to retrieve invoices.');
    }
  }

  @Get('create')
  @Render('invoices/create')
  async createForm() {
    const bookings = await this.invoicesService.findEligibleBookings();
    return { bookings };
  }

  @Post('create')
  @Redirect('/invoices')
  async create(@Body() body: CreateInvoiceDto) {
    try {
      // Auto-generate invoice number like INV-YYYYMMDD-XXXX (4-digit sequence)
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const base = `INV-${yyyy}${mm}${dd}`;
      let seq = 1;
      let invoiceNumber = `${base}-${String(seq).padStart(4, '0')}`;
      // try a few times to avoid collisions on concurrent requests
      // in practice you may switch to a DB-side unique sequence
      let created = false;
      while (!created) {
        try {
          await this.invoicesService.create({
            invoiceNumber,
            dueDate: body.dueDate,
            amount: body.amount,
            bookingId: body.bookingId,
          });
          created = true;
        } catch (err: unknown) {
          if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
            const target = Array.isArray(err.meta?.target) ? (err.meta?.target as string[]) : [];
            if (target.includes('invoiceNumber')) {
              seq += 1;
              invoiceNumber = `${base}-${String(seq).padStart(4, '0')}`;
              continue;
            }
            if (target.includes('bookingId')) {
              // stop the loop and rethrow so outer catch can produce a friendly message
              throw new BadRequestException('An invoice already exists for this booking.');
            }
          }
          throw err;
        }
      }
    } catch (err: unknown) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          throw new BadRequestException('Unique constraint conflict (number or booking).');
        }
        if (err.code === 'P2003') {
          throw new BadRequestException('Invalid booking.');
        }
      }
      throw new InternalServerErrorException('Error creating invoice.');
    }
    return;
  }

  @Delete(':id/delete')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    try {
      await this.invoicesService.delete(id);
    } catch (err: unknown) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
        throw new BadRequestException('Invoice not found.');
      }
      throw new InternalServerErrorException('Error deleting invoice.');
    }
  }

  @Get(':id')
  @Render('invoices/show')
  async show(@Param('id') id: string) {
    const invoice = await this.invoicesService.findOne(id);
    if (!invoice) {
      throw new InternalServerErrorException('Invoice not found');
    }
    return { invoice };
  }

  @Get(':id/edit')
  @Render('invoices/edit')
  async editForm(@Param('id') id: string) {
    const [invoice, bookings] = await Promise.all([
      this.invoicesService.findOne(id),
      this.prisma.booking.findMany({
        include: { property: true, client: true },
        orderBy: { startDate: 'desc' },
      }),
    ]);
    if (!invoice) {
      throw new InternalServerErrorException('Invoice not found');
    }
    return { invoice, bookings };
  }

  @Post(':id/edit')
  @Redirect('/invoices')
  async update(@Param('id') id: string, @Body() body: UpdateInvoiceDto) {
    try {
      await this.invoicesService.update(id, body);
      return;
    } catch (err: unknown) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2025') {
          throw new BadRequestException('Invoice not found.');
        }
        if (err.code === 'P2002') {
          throw new BadRequestException(
            'Invoice number already used or invoice already linked to this booking.',
          );
        }
        if (err.code === 'P2003') {
          throw new BadRequestException('Invalid booking.');
        }
      }
      throw new InternalServerErrorException('Error updating invoice.');
    }
  }
}
