import {
  Controller,
  Get,
  Render,
  InternalServerErrorException,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  BadRequestException,
  Redirect,
  Query,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Prisma } from '@prisma/client';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  @Render('clients/index')
  async index(@Query('q') q?: string, @Query('page') page?: string) {
    try {
      const currentPage = Math.max(1, parseInt(page || '1', 10));
      const pageSize = 15;

      const { clients, total } = await this.clientsService.findAll(q, currentPage, pageSize);
      const totalPages = Math.ceil(total / pageSize);

      return {
        clients,
        q,
        activeNav: 'clients',
        pagination: {
          currentPage,
          totalPages,
          total,
          hasNext: currentPage < totalPages,
          hasPrev: currentPage > 1,
        },
      };
    } catch {
      throw new InternalServerErrorException('Failed to retrieve clients.');
    }
  }

  @Get('create')
  @Render('clients/create')
  createForm() {
    return {};
  }

  @Post('create')
  @Redirect('/clients')
  async create(@Body() body: CreateClientDto) {
    await this.clientsService.create(body);
    return;
  }

  @Delete(':id/delete')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    try {
      await this.clientsService.delete(id);
    } catch (err: unknown) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2003') {
          throw new BadRequestException('Cannot delete this client: linked bookings exist.');
        }
        if (err.code === 'P2025') {
          throw new BadRequestException('Client not found.');
        }
      }
      throw new InternalServerErrorException('Error deleting client.');
    }
  }

  @Get(':id')
  @Render('clients/show')
  async show(@Param('id') id: string) {
    const client = await this.clientsService.findOne(id);
    if (!client) {
      throw new InternalServerErrorException('Client not found');
    }
    return { client };
  }

  @Get(':id/edit')
  @Render('clients/edit')
  async editForm(@Param('id') id: string) {
    const client = await this.clientsService.findOne(id);
    if (!client) {
      throw new InternalServerErrorException('Client not found');
    }
    return { client };
  }

  @Post(':id/edit')
  @Redirect('/clients')
  async update(@Param('id') id: string, @Body() body: UpdateClientDto) {
    await this.clientsService.update(id, body);
    return;
  }
}
