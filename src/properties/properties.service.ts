import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Property } from '@prisma/client';

@Injectable()
export class PropertiesService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Property[]> {
    return this.prisma.property.findMany();
  }

  async create(data: { name: string; address?: string; description?: string }): Promise<Property> {
    return this.prisma.property.create({ data });
  }

  async delete(id: string): Promise<Property> {
    return this.prisma.property.delete({ where: { id } });
  }

  async findOne(id: string): Promise<Property | null> {
    return this.prisma.property.findUnique({ where: { id } });
  }

  async update(
    id: string,
    data: { name?: string; address?: string; description?: string },
  ): Promise<Property> {
    return this.prisma.property.update({ where: { id }, data });
  }
}
