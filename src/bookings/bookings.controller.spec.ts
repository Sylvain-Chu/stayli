import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import type { BookingsService } from './bookings.service';
import type { PrismaService } from 'src/prisma/prisma.service';
import type { InvoicesService } from 'src/invoices/invoices.service';
import { Prisma } from '@prisma/client';

type BookingShape = {
  id: string;
  startDate: Date;
  endDate: Date;
  status?: string;
  totalPrice?: number | null;
  propertyId?: string;
  clientId?: string;
  property?: { name: string };
  client?: { firstName: string; lastName: string };
  invoice?: { id: string } | null;
};

type MockBookingsService = {
  findAll: jest.Mock<Promise<BookingShape[]>, [args: { from?: Date; to?: Date }]>;
  findOverlappingRange: jest.Mock<Promise<BookingShape[]>, [args: { start?: Date; end?: Date }]>;
  create: jest.Mock<Promise<unknown>, [body: unknown]>;
  delete: jest.Mock<Promise<unknown>, [id: string]>;
  findOne: jest.Mock<Promise<BookingShape | null>, [id: string]>;
  update: jest.Mock<Promise<unknown>, [id: string, body: unknown]>;
};

type MockPrisma = {
  property: { findMany: jest.Mock<Promise<any[]>, [any?]> };
  client: { findMany: jest.Mock<Promise<any[]>, [any?]> };
};

type MockInvoicesService = {
  create: jest.Mock<Promise<{ id: string }>, [body: any]>;
};

function prismaKnownError(code: string) {
  const err = new Error(code) as unknown as { code: string };
  err.code = code;

  Object.setPrototypeOf(
    err as unknown as object,
    (Prisma as unknown as { PrismaClientKnownRequestError: { prototype: object } })
      .PrismaClientKnownRequestError.prototype,
  );
  return err;
}

describe('BookingsController', () => {
  let controller: BookingsController;
  let service: MockBookingsService;
  let prisma: MockPrisma;
  let invoices: MockInvoicesService;

  beforeEach(() => {
    service = {
      findAll: jest.fn<Promise<BookingShape[]>, [args: { from?: Date; to?: Date }]>(),
      findOverlappingRange: jest.fn<
        Promise<BookingShape[]>,
        [args: { start?: Date; end?: Date }]
      >(),
      create: jest.fn<Promise<unknown>, [body: unknown]>(),
      delete: jest.fn<Promise<unknown>, [id: string]>(),
      findOne: jest.fn<Promise<BookingShape | null>, [id: string]>(),
      update: jest.fn<Promise<unknown>, [id: string, body: unknown]>(),
    };
    prisma = {
      property: { findMany: jest.fn<Promise<unknown[]>, [args?: unknown]>() },
      client: { findMany: jest.fn<Promise<unknown[]>, [args?: unknown]>() },
    };
    invoices = { create: jest.fn<Promise<{ id: string }>, [body: unknown]>() };
    controller = new BookingsController(
      service as unknown as BookingsService,
      prisma as unknown as PrismaService,
      invoices as unknown as InvoicesService,
    );
  });

  it('index validates dates and returns data', async () => {
    service.findAll.mockResolvedValueOnce([
      { id: 'b1', startDate: new Date('2025-01-01'), endDate: new Date('2025-01-02') },
    ]);
    const res = await controller.index('2025-01-01', '2025-01-10');
    expect(service.findAll).toHaveBeenCalled();
    expect(res).toEqual({
      bookings: [expect.objectContaining({ id: 'b1' })],
      from: '2025-01-01',
      to: '2025-01-10',
    });
  });

  it('index throws on invalid from', async () => {
    await expect(controller.index('not-a-date', undefined)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('index throws on invalid to', async () => {
    await expect(controller.index(undefined, 'nope')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('events validates dates, filters status, and maps', async () => {
    service.findOverlappingRange.mockResolvedValueOnce([
      {
        id: '1',
        startDate: new Date('2025-01-02'),
        endDate: new Date('2025-01-04'),
        status: 'confirmed',
        totalPrice: 100,
        propertyId: 'p1',
        clientId: 'c1',
        property: { name: 'House' },
        client: { firstName: 'A', lastName: 'B' },
      },
      {
        id: '2',
        status: 'pending',
        startDate: new Date(),
        endDate: new Date(),
        totalPrice: 50,
        propertyId: 'p2',
        clientId: 'c2',
        property: { name: 'Flat' },
        client: { firstName: 'C', lastName: 'D' },
      },
    ]);
    const res = await controller.events('2025-01-01', '2025-01-10', ['confirmed']);
    expect(Array.isArray(res)).toBe(true);
    expect((res as Array<Record<string, unknown>>).length).toBe(1);
    const ev = (res as Array<Record<string, unknown>>)[0];
    expect(ev).toMatchObject({ id: '1', url: '/bookings/1' });
  });

  it('events invalid start throws', async () => {
    await expect(controller.events('x', undefined, undefined)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('events invalid end throws', async () => {
    await expect(controller.events(undefined, 'y', undefined)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('createForm fetches clients and properties', async () => {
    prisma.property.findMany.mockResolvedValueOnce([{ id: 'p' }]);
    prisma.client.findMany.mockResolvedValueOnce([{ id: 'c' }]);
    const res = await controller.createForm();
    expect(res).toEqual({ properties: [{ id: 'p' }], clients: [{ id: 'c' }] });
  });

  it('create maps prisma FK error to 400', async () => {
    service.create.mockRejectedValueOnce(prismaKnownError('P2003'));
    await expect(
      controller.create({} as unknown as import('./dto/create-booking.dto').CreateBookingDto),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('create maps unknown to 500', async () => {
    service.create.mockRejectedValueOnce(new Error('x'));
    await expect(
      controller.create({} as unknown as import('./dto/create-booking.dto').CreateBookingDto),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
  });

  it('remove maps P2025 to 400', async () => {
    service.delete.mockRejectedValueOnce(prismaKnownError('P2025'));
    await expect(controller.remove('1')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('remove maps unknown to 500', async () => {
    service.delete.mockRejectedValueOnce(new Error('x'));
    await expect(controller.remove('1')).rejects.toBeInstanceOf(InternalServerErrorException);
  });

  it('show/editForm not found throws 500', async () => {
    service.findOne.mockResolvedValueOnce(null);
    await expect(controller.show('1')).rejects.toBeInstanceOf(InternalServerErrorException);
    service.findOne.mockResolvedValueOnce(null);
    await expect(controller.editForm('1')).rejects.toBeInstanceOf(InternalServerErrorException);
  });

  it('update maps P2025 to 400 and unknown to 500', async () => {
    service.update.mockRejectedValueOnce(prismaKnownError('P2025'));
    await expect(
      controller.update('1', {} as unknown as import('./dto/update-booking.dto').UpdateBookingDto),
    ).rejects.toBeInstanceOf(BadRequestException);
    service.update.mockRejectedValueOnce(new Error('x'));
    await expect(
      controller.update('1', {} as unknown as import('./dto/update-booking.dto').UpdateBookingDto),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
  });

  it('cancel maps P2025 to 400 and unknown to 500', async () => {
    service.update.mockRejectedValueOnce(prismaKnownError('P2025'));
    await expect(controller.cancel('1')).rejects.toBeInstanceOf(BadRequestException);
    service.update.mockRejectedValueOnce(new Error('x'));
    await expect(controller.cancel('1')).rejects.toBeInstanceOf(InternalServerErrorException);
  });

  it('generateInvoice validates conditions and returns url', async () => {
    service.findOne.mockResolvedValueOnce({
      id: 'b',
      startDate: new Date(),
      endDate: new Date(),
      totalPrice: 100,
      invoice: null,
    });
    invoices.create.mockResolvedValueOnce({ id: 'inv1' });
    const res = await controller.generateInvoice('b');
    expect(res).toEqual({ url: '/invoices/inv1' });
  });

  it('generateInvoice: not found', async () => {
    service.findOne.mockResolvedValueOnce(null);
    await expect(controller.generateInvoice('b')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('generateInvoice: already has invoice', async () => {
    service.findOne.mockResolvedValueOnce({
      id: 'b',
      startDate: new Date(),
      endDate: new Date(),
      totalPrice: 100,
      invoice: { id: 'x' },
    });
    await expect(controller.generateInvoice('b')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('generateInvoice: missing price', async () => {
    service.findOne.mockResolvedValueOnce({
      id: 'b',
      startDate: new Date(),
      endDate: new Date(),
      totalPrice: null,
      invoice: null,
    });
    await expect(controller.generateInvoice('b')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('generateInvoice: non-positive price', async () => {
    service.findOne.mockResolvedValueOnce({
      id: 'b',
      startDate: new Date(),
      endDate: new Date(),
      totalPrice: 0,
      invoice: null,
    });
    await expect(controller.generateInvoice('b')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('generateInvoice: prisma FK error -> 400', async () => {
    service.findOne.mockResolvedValueOnce({
      id: 'b',
      startDate: new Date(),
      endDate: new Date(),
      totalPrice: 100,
      invoice: null,
    });
    invoices.create.mockRejectedValueOnce(prismaKnownError('P2003'));
    await expect(controller.generateInvoice('b')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('generateInvoice: unknown -> 500', async () => {
    service.findOne.mockResolvedValueOnce({
      id: 'b',
      startDate: new Date(),
      endDate: new Date(),
      totalPrice: 100,
      invoice: null,
    });
    invoices.create.mockRejectedValueOnce(new Error('x'));
    await expect(controller.generateInvoice('b')).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
  });
});
