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
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { Prisma } from '@prisma/client';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  @Render('clients/index')
  async index() {
    try {
      const clients = await this.clientsService.findAll();
      return { clients };
    } catch {
      throw new InternalServerErrorException('Impossible de r\u00e9cup\u00e9rer les clients.');
    }
  }

  @Get('create')
  @Render('clients/create')
  createForm() {
    return {};
  }

  @Post('create')
  @Redirect('/clients')
  async create(
    @Body() body: { firstName: string; lastName: string; email: string; phone?: string },
  ) {
    await this.clientsService.create({
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
    });
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
          throw new BadRequestException(
            'Impossible de supprimer ce client: des réservations y sont liées.',
          );
        }
        if (err.code === 'P2025') {
          throw new BadRequestException('Client introuvable.');
        }
      }
      throw new InternalServerErrorException('Erreur lors de la suppression du client.');
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
  async update(
    @Param('id') id: string,
    @Body() body: { firstName?: string; lastName?: string; email?: string; phone?: string },
  ) {
    await this.clientsService.update(id, {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
    });
    return;
  }
}
