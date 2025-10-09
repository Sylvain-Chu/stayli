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
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('bookings')
export class BookingsController {
  constructor(
    private readonly bookingsService: BookingsService,
    private readonly prisma: PrismaService,
  ) {}

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
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2003') {
          // FK constraint
          throw new BadRequestException('Propriété ou client invalide.');
        }
      }
      throw new InternalServerErrorException('Erreur lors de la création de la réservation.');
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
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2025') {
          throw new BadRequestException('Réservation introuvable.');
        }
        if (err.code === 'P2003') {
          throw new BadRequestException('Propriété ou client invalide.');
        }
      }
      throw new InternalServerErrorException('Erreur lors de la mise à jour de la réservation.');
    }
  }
}
