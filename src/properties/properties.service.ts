import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, Property } from '@prisma/client';

@Injectable()
export class PropertiesService {
  constructor(private prisma: PrismaService) {}

  async findAll(q?: string): Promise<Property[]> {
    const where: Prisma.PropertyWhereInput | undefined = q
      ? {
          OR: [
            { name: { contains: q, mode: Prisma.QueryMode.insensitive } },
            { address: { contains: q, mode: Prisma.QueryMode.insensitive } },
            { description: { contains: q, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : undefined;
    return this.prisma.property.findMany({ where, orderBy: { name: 'asc' } });
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
