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
  Query,
} from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { Prisma } from '@prisma/client';

@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Get()
  @Render('properties/index')
  async root(@Query('q') q?: string, @Query('page') page?: string) {
    try {
      const currentPage = Math.max(1, parseInt(page || '1', 10));
      const pageSize = 15;

      const { properties, total } = await this.propertiesService.findAll(q, currentPage, pageSize);
      const totalPages = Math.ceil(total / pageSize);

      return {
        properties,
        q,
        activeNav: 'properties',
        pagination: {
          currentPage,
          totalPages,
          total,
          hasNext: currentPage < totalPages,
          hasPrev: currentPage > 1,
        },
      };
    } catch {
      throw new InternalServerErrorException('Failed to retrieve properties.');
    }
  }

  @Get('create')
  @Render('properties/create')
  createForm() {
    return {};
  }

  @Post('create')
  @Redirect('/properties')
  async create(@Body() body: CreatePropertyDto) {
    await this.propertiesService.create(body);
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
          throw new BadRequestException('Cannot delete this property: linked bookings exist.');
        }
        if (err.code === 'P2025') {
          throw new BadRequestException('Property not found.');
        }
      }
      throw new InternalServerErrorException('Error deleting property.');
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
  async update(@Param('id') id: string, @Body() body: UpdatePropertyDto) {
    await this.propertiesService.update(id, body);
    return;
  }
}
