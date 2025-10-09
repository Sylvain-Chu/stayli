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
import { Prisma } from '@prisma/client';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  @Render('bookings/index')
  async index() {
    try {
      const bookings = await this.bookingsService.findAll();
      return { bookings };
    } catch {
      throw new InternalServerErrorException('Impossible de r\u00e9cup\u00e9rer les bookings.');
    }
  }

  @Get('create')
  @Render('bookings/create')
  createForm() {
    return {};
  }

  @Post('create')
  @Redirect('/bookings')
  async create(
    @Body()
    body: {
      startDate: string;
      endDate: string;
      totalPrice: number;
      propertyId: string;
      clientId: string;
    },
  ) {
    await this.bookingsService.create({
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      totalPrice: Number(body.totalPrice),
      propertyId: body.propertyId,
      clientId: body.clientId,
    });
    return;
  }

  @Delete(':id/delete')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    try {
      await this.bookingsService.delete(id);
    } catch (err: unknown) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2025') {
          throw new BadRequestException('Réservation introuvable.');
        }
      }
      throw new InternalServerErrorException('Erreur lors de la suppression de la réservation.');
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
    const booking = await this.bookingsService.findOne(id);
    if (!booking) {
      throw new InternalServerErrorException('Booking not found');
    }
    return { booking };
  }

  @Post(':id/edit')
  @Redirect('/bookings')
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      startDate?: string;
      endDate?: string;
      totalPrice?: number;
      status?: string;
    },
  ) {
    await this.bookingsService.update(id, {
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      totalPrice: body.totalPrice !== undefined ? Number(body.totalPrice) : undefined,
      status: body.status,
    });
    return;
  }
}
