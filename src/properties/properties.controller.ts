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
import { PropertiesService } from './properties.service';
import { Prisma } from '@prisma/client';

@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Get()
  @Render('properties/index')
  async root() {
    try {
      const properties = await this.propertiesService.findAll();
      return { properties };
    } catch {
      throw new InternalServerErrorException('Impossible de récupérer les propriétés.');
    }
  }

  @Get('create')
  @Render('properties/create')
  createForm() {
    return {};
  }

  @Post('create')
  @Redirect('/properties')
  async create(@Body() body: { name: string; address?: string; description?: string }) {
    await this.propertiesService.create({
      name: body.name,
      address: body.address,
      description: body.description,
    });
    return;
  }

  @Delete(':id/delete')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    try {
      await this.propertiesService.delete(id);
    } catch (err: unknown) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2003') {
          throw new BadRequestException(
            'Impossible de supprimer cette propriété: des réservations y sont liées.',
          );
        }
        if (err.code === 'P2025') {
          throw new BadRequestException('Propriété introuvable.');
        }
      }
      throw new InternalServerErrorException('Erreur lors de la suppression de la propriété.');
    }
  }

  @Get(':id')
  @Render('properties/show')
  async show(@Param('id') id: string) {
    const property = await this.propertiesService.findOne(id);
    if (!property) {
      throw new InternalServerErrorException('Property not found');
    }
    return { property };
  }

  @Get(':id/edit')
  @Render('properties/edit')
  async editForm(@Param('id') id: string) {
    const property = await this.propertiesService.findOne(id);
    if (!property) {
      throw new InternalServerErrorException('Property not found');
    }
    return { property };
  }

  @Post(':id/edit')
  @Redirect('/properties')
  async update(
    @Param('id') id: string,
    @Body() body: { name?: string; address?: string; description?: string },
  ) {
    await this.propertiesService.update(id, {
      name: body.name,
      address: body.address,
      description: body.description,
    });
    return;
  }
}
