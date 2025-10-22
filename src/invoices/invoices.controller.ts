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
  Query,
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
  async index(
    @Query('page') page?: string,
    @Query('q') q?: string,
    @Query('status') status?: string,
  ) {
    try {
      const currentPage = Math.max(1, parseInt(page || '1', 10));
      const pageSize = 15;

      const { invoices, total } = await this.invoicesService.findAll(
        currentPage,
        pageSize,
        q,
        status,
      );
      const totalPages = Math.ceil(total / pageSize);

      // Add isOverdue flag to each invoice
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const invoicesWithOverdueFlag = invoices.map((invoice) => {
        const isOverdue =
          invoice.status !== 'paid' &&
          invoice.status !== 'cancelled' &&
          invoice.dueDate &&
          new Date(invoice.dueDate) < today;

        return {
          ...invoice,
          isOverdue,
        };
      });

      return {
        invoices: invoicesWithOverdueFlag,
        q,
        status,
        activeNav: 'invoices',
        pagination: {
          currentPage,
          totalPages,
          total,
          hasNext: currentPage < totalPages,
          hasPrev: currentPage > 1,
        },
      };
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
      const inv = await this.invoicesService.create({
        dueDate: body.dueDate,
        amount: body.amount,
        bookingId: body.bookingId,
      });
      return { url: `/invoices/${inv.id}` };
    } catch (err: unknown) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2003') {
          throw new BadRequestException('Invalid booking.');
        }
        if (err.code === 'P2002') {
          throw new BadRequestException('Booking already has an invoice.');
        }
      }
      throw new InternalServerErrorException('Error creating invoice.');
    }
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
