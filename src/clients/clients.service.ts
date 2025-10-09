import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Client } from '@prisma/client';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Client[]> {
    return this.prisma.client.findMany();
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
