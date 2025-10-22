import { ClientsService } from './clients.service';
import type { Client, Prisma } from '@prisma/client';
import type { PrismaService } from 'src/prisma/prisma.service';

type FindManyArgs = {
  where?: Prisma.ClientWhereInput;
  orderBy: Array<Record<string, 'asc' | 'desc'>>;
};

type ClientModel = {
  findMany: (args: FindManyArgs) => Promise<Client[]>;
  create: (args: {
    data: { firstName: string; lastName: string; email: string; phone?: string };
  }) => Promise<Client>;
  delete: (args: { where: { id: string } }) => Promise<Client>;
  findUnique: (args: { where: { id: string } }) => Promise<Client | null>;
  update: (args: {
    where: { id: string };
    data: { firstName?: string; lastName?: string; email?: string; phone?: string };
  }) => Promise<Client>;
  count: (args: { where?: Prisma.ClientWhereInput }) => Promise<number>;
};

type MockPrismaService = { client: jest.Mocked<ClientModel> };

describe('ClientsService', () => {
  let service: ClientsService;
  let prisma: MockPrismaService;

  beforeEach(() => {
    const clientModel: jest.Mocked<ClientModel> = {
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    };
    prisma = { client: clientModel };
    service = new ClientsService(prisma as unknown as PrismaService);
  });

  it('findAll without q returns sorted list', async () => {
    prisma.client.findMany.mockResolvedValue([] as Client[]);
    prisma.client.count.mockResolvedValue(0);
    const res = await service.findAll();
    expect(res).toEqual({ clients: [], total: 0 });
    expect(prisma.client.findMany).toHaveBeenCalled();
  });

  it('findAll with q builds OR filters (case-insensitive)', async () => {
    prisma.client.findMany.mockResolvedValue([] as Client[]);
    prisma.client.count.mockResolvedValue(0);
    await service.findAll('john');
    const calls = (prisma.client.findMany as unknown as jest.Mock).mock.calls as Array<
      [FindManyArgs]
    >;
    const callArg = calls[0][0] as unknown as {
      where: { OR: Array<Record<string, { contains: string; mode: string }>> };
    };
    expect(callArg.where).toBeDefined();
    expect(callArg.where.OR).toHaveLength(4);
    for (const clause of callArg.where.OR) {
      const [[, value]] = Object.entries(clause) as Array<
        [string, { contains: string; mode: string }]
      >;
      expect(value).toMatchObject({ contains: 'john', mode: 'insensitive' });
    }
  });

  it('create calls prisma.client.create with data', async () => {
    const data = { firstName: 'John', lastName: 'Doe', email: 'j@d.com' };
    prisma.client.create.mockResolvedValue({ id: '1', ...data } as unknown as Client);
    const res = await service.create(data);
    expect(prisma.client.create).toHaveBeenCalledWith({ data });
    expect(res).toEqual({ id: '1', ...data });
  });

  it('delete calls prisma.client.delete with id', async () => {
    prisma.client.delete.mockResolvedValue({ id: '1' } as unknown as Client);
    const res = await service.delete('1');
    expect(prisma.client.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    expect(res).toEqual({ id: '1' });
  });

  it('findOne calls prisma.client.findUnique', async () => {
    prisma.client.findUnique.mockResolvedValue({ id: '2' } as unknown as Client);
    const res = await service.findOne('2');
    expect(prisma.client.findUnique).toHaveBeenCalledWith({
      where: { id: '2' },
      include: {
        bookings: {
          include: { property: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    expect(res).toEqual({ id: '2' });
  });

  it('update calls prisma.client.update with id and data', async () => {
    prisma.client.update.mockResolvedValue({ id: '3', firstName: 'J' } as unknown as Client);
    const res = await service.update('3', { firstName: 'J' });
    expect(prisma.client.update).toHaveBeenCalledWith({
      where: { id: '3' },
      data: { firstName: 'J' },
    });
    expect(res).toEqual({ id: '3', firstName: 'J' });
  });
});
