import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Client, Prisma } from '@prisma/client';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async findAll(q?: string): Promise<Client[]> {
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
    return this.prisma.client.findMany({
      where,
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });
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

  async findOne(id: string): Promise<Client | null> {
    return this.prisma.client.findUnique({ where: { id } });
  }

  async update(
    id: string,
    data: { firstName?: string; lastName?: string; email?: string; phone?: string },
  ): Promise<Client> {
    return this.prisma.client.update({ where: { id }, data });
  }
}
