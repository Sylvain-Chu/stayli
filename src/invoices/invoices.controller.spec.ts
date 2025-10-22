import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InvoicesController } from './invoices.controller';
import type { InvoicesService } from './invoices.service';
import type { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

type MockInvoicesService = {
  findAll: jest.Mock<Promise<unknown[]>, []>;
  findEligibleBookings: jest.Mock<Promise<unknown[]>, []>;
  create: jest.Mock<
    Promise<{ id: string }>,
    [args: { dueDate: Date; amount: number; bookingId: string }]
  >;
  delete: jest.Mock<Promise<unknown>, [id: string]>;
  findOne: jest.Mock<Promise<Record<string, unknown> | null>, [id: string]>;
  update: jest.Mock<Promise<unknown>, [id: string, body: Record<string, unknown>]>;
};

type MockPrisma = {
  booking: { findMany: jest.Mock<Promise<unknown[]>, [args: Prisma.BookingFindManyArgs]> };
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

describe('InvoicesController', () => {
  let controller: InvoicesController;
  let service: MockInvoicesService;
  let prisma: MockPrisma;

  beforeEach(() => {
    service = {
      findAll: jest.fn<Promise<{ invoices: unknown[]; total: number }>, []>(),
      findEligibleBookings: jest.fn<Promise<unknown[]>, []>(),
      create: jest.fn<
        Promise<{ id: string }>,
        [args: { dueDate: Date; amount: number; bookingId: string }]
      >(),
      delete: jest.fn<Promise<unknown>, [id: string]>(),
      findOne: jest.fn<Promise<Record<string, unknown> | null>, [id: string]>(),
      update: jest.fn<Promise<unknown>, [id: string, body: Record<string, unknown>]>(),
    };
    prisma = {
      booking: {
        findMany: jest.fn<Promise<unknown[]>, [Prisma.BookingFindManyArgs]>(),
      },
    };
    controller = new InvoicesController(
      service as unknown as InvoicesService,
      prisma as unknown as PrismaService,
    );
  });

  it('index returns invoices and maps unknown error to 500', async () => {
    service.findAll.mockResolvedValueOnce({ invoices: [{ id: 'i1' }], total: 1 });
    const res = await controller.index();
    expect(res.invoices).toEqual([{ id: 'i1' }]);
    expect(res.activeNav).toEqual('invoices');

    service.findAll.mockRejectedValueOnce(new Error('x'));
    await expect(controller.index()).rejects.toBeInstanceOf(InternalServerErrorException);
  });

  it('createForm returns eligible bookings', async () => {
    service.findEligibleBookings.mockResolvedValueOnce([{ id: 'b1' }]);
    const res = await controller.createForm();
    expect(res).toEqual({ bookings: [{ id: 'b1' }] });
  });

  it('create returns redirect url on success', async () => {
    service.create.mockResolvedValueOnce({ id: 'i1' });
    const res = await controller.create({
      dueDate: new Date(),
      amount: 10,
      bookingId: 'b1',
    } as unknown as import('./dto/create-invoice.dto').CreateInvoiceDto);
    expect(res).toEqual({ url: '/invoices/i1' });
  });

  it('create maps P2003 and P2002 to 400; unknown to 500', async () => {
    service.create.mockRejectedValueOnce(prismaKnownError('P2003'));
    await expect(
      controller.create({
        dueDate: new Date(),
        amount: 10,
        bookingId: 'b1',
      } as unknown as import('./dto/create-invoice.dto').CreateInvoiceDto),
    ).rejects.toBeInstanceOf(BadRequestException);

    service.create.mockRejectedValueOnce(prismaKnownError('P2002'));
    await expect(
      controller.create({
        dueDate: new Date(),
        amount: 10,
        bookingId: 'b1',
      } as unknown as import('./dto/create-invoice.dto').CreateInvoiceDto),
    ).rejects.toBeInstanceOf(BadRequestException);

    service.create.mockRejectedValueOnce(new Error('x'));
    await expect(
      controller.create({
        dueDate: new Date(),
        amount: 10,
        bookingId: 'b1',
      } as unknown as import('./dto/create-invoice.dto').CreateInvoiceDto),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
  });

  it('remove maps P2025 to 400; otherwise 500', async () => {
    service.delete.mockRejectedValueOnce(prismaKnownError('P2025'));
    await expect(controller.remove('i1')).rejects.toBeInstanceOf(BadRequestException);
    service.delete.mockRejectedValueOnce(new Error('x'));
    await expect(controller.remove('i1')).rejects.toBeInstanceOf(InternalServerErrorException);
  });

  it('show returns invoice or 500 when not found', async () => {
    service.findOne.mockResolvedValueOnce({ id: 'i1' });
    const res = await controller.show('i1');
    expect(res).toEqual({ invoice: { id: 'i1' } });
    service.findOne.mockResolvedValueOnce(null);
    await expect(controller.show('i1')).rejects.toBeInstanceOf(InternalServerErrorException);
  });

  it('editForm returns invoice and bookings list or 500 when not found', async () => {
    service.findOne.mockResolvedValueOnce({ id: 'i1' });
    prisma.booking.findMany.mockResolvedValueOnce([{ id: 'b1' }]);
    const res = await controller.editForm('i1');
    expect(res).toEqual({ invoice: { id: 'i1' }, bookings: [{ id: 'b1' }] });

    service.findOne.mockResolvedValueOnce(null);
    await expect(controller.editForm('i2')).rejects.toBeInstanceOf(InternalServerErrorException);
  });

  it('update maps P2025/P2002/P2003 to 400; unknown to 500', async () => {
    service.update.mockRejectedValueOnce(prismaKnownError('P2025'));
    await expect(
      controller.update('i1', {} as unknown as import('./dto/update-invoice.dto').UpdateInvoiceDto),
    ).rejects.toBeInstanceOf(BadRequestException);

    service.update.mockRejectedValueOnce(prismaKnownError('P2002'));
    await expect(
      controller.update('i1', {} as unknown as import('./dto/update-invoice.dto').UpdateInvoiceDto),
    ).rejects.toBeInstanceOf(BadRequestException);

    service.update.mockRejectedValueOnce(prismaKnownError('P2003'));
    await expect(
      controller.update('i1', {} as unknown as import('./dto/update-invoice.dto').UpdateInvoiceDto),
    ).rejects.toBeInstanceOf(BadRequestException);

    service.update.mockRejectedValueOnce(new Error('x'));
    await expect(
      controller.update('i1', {} as unknown as import('./dto/update-invoice.dto').UpdateInvoiceDto),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
  });
});
