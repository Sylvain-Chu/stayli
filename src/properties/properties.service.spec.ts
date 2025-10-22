import { PropertiesService } from './properties.service';
import type { Property, Prisma } from '@prisma/client';
import type { PrismaService } from 'src/prisma/prisma.service';

type FindManyArgs = { where?: Prisma.PropertyWhereInput; orderBy: { name: 'asc' | 'desc' } };
type PropertyModel = {
  findMany: (args: FindManyArgs) => Promise<Property[]>;
  create: (args: {
    data: { name: string; address?: string; description?: string };
  }) => Promise<Property>;
  delete: (args: { where: { id: string } }) => Promise<Property>;
  findUnique: (args: { where: { id: string } }) => Promise<Property | null>;
  update: (args: {
    where: { id: string };
    data: { name?: string; address?: string; description?: string };
  }) => Promise<Property>;
  count: (args: { where?: Prisma.PropertyWhereInput }) => Promise<number>;
};

type MockPrisma = { property: jest.Mocked<PropertyModel> };

describe('PropertiesService', () => {
  let service: PropertiesService;
  let prisma: MockPrisma;

  beforeEach(() => {
    prisma = {
      property: {
        findMany: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
    } as unknown as MockPrisma;
    service = new PropertiesService(prisma as unknown as PrismaService);
  });

  it('findAll without q returns sorted list', async () => {
    prisma.property.findMany.mockResolvedValue([] as Property[]);
    prisma.property.count.mockResolvedValue(0);
    const res = await service.findAll();
    expect(res).toEqual({ properties: [], total: 0 });
    expect(prisma.property.findMany).toHaveBeenCalled();
  });

  it('findAll with q builds OR filters', async () => {
    prisma.property.findMany.mockResolvedValue([] as Property[]);
    prisma.property.count.mockResolvedValue(0);
    await service.findAll('villa');
    const calls = (prisma.property.findMany as unknown as jest.Mock).mock.calls as Array<
      [FindManyArgs]
    >;
    const arg = calls[0][0];
    expect(arg.where).toBeDefined();
    const OR = (arg.where as Prisma.PropertyWhereInput).OR as Array<Record<string, unknown>>;
    expect(Array.isArray(OR)).toBe(true);
    expect(OR).toHaveLength(3);
  });

  it('create calls prisma.property.create', async () => {
    const data = { name: 'Seaside', address: '1 Ocean', description: 'Sea view' };
    prisma.property.create.mockResolvedValue({ id: 'p1', ...data } as unknown as Property);
    const res = await service.create(data);
    expect(prisma.property.create).toHaveBeenCalledWith({ data });
    expect(res).toEqual({ id: 'p1', ...data });
  });

  it('delete calls prisma.property.delete', async () => {
    prisma.property.delete.mockResolvedValue({ id: 'p2' } as unknown as Property);
    const res = await service.delete('p2');
    expect(prisma.property.delete).toHaveBeenCalledWith({ where: { id: 'p2' } });
    expect(res).toEqual({ id: 'p2' });
  });

  it('findOne calls prisma.property.findUnique', async () => {
    prisma.property.findUnique.mockResolvedValue({ id: 'p3' } as unknown as Property);
    const res = await service.findOne('p3');
    expect(prisma.property.findUnique).toHaveBeenCalledWith({
      where: { id: 'p3' },
      include: {
        bookings: {
          include: { client: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    expect(res).toEqual({ id: 'p3' });
  });

  it('update calls prisma.property.update', async () => {
    prisma.property.update.mockResolvedValue({ id: 'p4', name: 'New' } as unknown as Property);
    const res = await service.update('p4', { name: 'New' });
    expect(prisma.property.update).toHaveBeenCalledWith({
      where: { id: 'p4' },
      data: { name: 'New' },
    });
    expect(res).toEqual({ id: 'p4', name: 'New' });
  });
});
