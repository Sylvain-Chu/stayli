import {
  Controller,
  Get,
  Render,
  InternalServerErrorException,
  Post,
  Body,
  Redirect,
  Param,
} from '@nestjs/common';
import { PropertiesService } from './properties.service';

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

  // HTML forms don't support DELETE; use POST to ':id/delete'
  @Post(':id/delete')
  @Redirect('/properties')
  async remove(@Param('id') id: string) {
    await this.propertiesService.delete(id);
    return;
  }
}
