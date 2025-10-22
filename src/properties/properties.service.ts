import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, Property } from '@prisma/client';

@Injectable()
export class PropertiesService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    q?: string,
    page: number = 1,
    pageSize: number = 15,
  ): Promise<{ properties: Property[]; total: number }> {
    const where: Prisma.PropertyWhereInput | undefined = q
      ? {
          OR: [
            { name: { contains: q, mode: Prisma.QueryMode.insensitive } },
            { address: { contains: q, mode: Prisma.QueryMode.insensitive } },
            { description: { contains: q, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : undefined;

    const [properties, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.property.count({ where }),
    ]);

    return { properties, total };
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
