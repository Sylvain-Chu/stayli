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
import { Prisma } from '@prisma/client';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  @Render('invoices/index')
  async index() {
    try {
      const invoices = await this.invoicesService.findAll();
      return { invoices };
    } catch {
      throw new InternalServerErrorException('Impossible de r\u00e9cup\u00e9rer les invoices.');
    }
  }

  @Get('create')
  @Render('invoices/create')
  createForm() {
    return {};
  }

  @Post('create')
  @Redirect('/invoices')
  async create(
    @Body()
    body: {
      invoiceNumber: string;
      dueDate: string;
      amount: number;
      bookingId: string;
    },
  ) {
    let dueDate = body.dueDate ? new Date(body.dueDate) : new Date();
    if (isNaN(dueDate.getTime())) {
      dueDate = new Date();
    }
    try {
      await this.invoicesService.create({
        invoiceNumber: body.invoiceNumber,
        dueDate,
        amount: Number(body.amount),
        bookingId: body.bookingId,
      });
    } catch (err: unknown) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new BadRequestException('Une facture existe déjà pour cette réservation.');
      }
      throw new InternalServerErrorException('Erreur lors de la création de la facture.');
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
        throw new BadRequestException('Facture introuvable.');
      }
      throw new InternalServerErrorException('Erreur lors de la suppression de la facture.');
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
    const invoice = await this.invoicesService.findOne(id);
    if (!invoice) {
      throw new InternalServerErrorException('Invoice not found');
    }
    return { invoice };
  }

  @Post(':id/edit')
  @Redirect('/invoices')
  async update(
    @Param('id') id: string,
    @Body()
    body: { invoiceNumber?: string; dueDate?: string; amount?: number; status?: string },
  ) {
    let dueDate: Date | undefined = undefined;
    if (body.dueDate) {
      const parsed = new Date(body.dueDate);
      if (!isNaN(parsed.getTime())) dueDate = parsed;
    }
    await this.invoicesService.update(id, {
      invoiceNumber: body.invoiceNumber,
      dueDate,
      amount: body.amount !== undefined ? Number(body.amount) : undefined,
      status: body.status,
    });
    return;
  }
}
