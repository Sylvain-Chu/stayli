import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Client, Prisma } from '@prisma/client';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    q?: string,
    page: number = 1,
    pageSize: number = 15,
  ): Promise<{ clients: Client[]; total: number }> {
    const where: Prisma.ClientWhereInput | undefined = q
      ? {
          OR: [
            { firstName: { contains: q, mode: Prisma.QueryMode.insensitive } },
            { lastName: { contains: q, mode: Prisma.QueryMode.insensitive } },
            { email: { contains: q, mode: Prisma.QueryMode.insensitive } },
            { phone: { contains: q, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : undefined;

    const [clients, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.client.count({ where }),
    ]);

    return { clients, total };
  }

  async create(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  }): Promise<Client> {
    return this.prisma.client.create({ data });
  }

  async delete(id: string): Promise<Client> {
    return this.prisma.client.delete({ where: { id } });
  }

  async findOne(id: string) {
    return this.prisma.client.findUnique({
      where: { id },
      include: {
        bookings: {
          include: {
            property: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
  }

  async update(
    id: string,
    data: { firstName?: string; lastName?: string; email?: string; phone?: string },
  ): Promise<Client> {
    return this.prisma.client.update({ where: { id }, data });
  }
}
