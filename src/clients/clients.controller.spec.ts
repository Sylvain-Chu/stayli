import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ClientsController } from './clients.controller';
import type { ClientsService } from './clients.service';
import { Prisma } from '@prisma/client';

type MockClientsService = {
  findAll: jest.Mock<Promise<unknown>, [q?: string]>;
  create: jest.Mock<Promise<unknown>, [body: unknown]>;
  delete: jest.Mock<Promise<unknown>, [id: string]>;
  findOne: jest.Mock<Promise<unknown>, [id: string]>;
  update: jest.Mock<Promise<unknown>, [id: string, body: unknown]>;
};

function prismaKnownError(code: string) {
  // Create a lightweight object with the correct prototype so instanceof works
  const err = new Error(code) as unknown as { code: string };
  err.code = code;
  const P = Prisma as unknown as {
    PrismaClientKnownRequestError: { prototype: object };
  };
  Object.setPrototypeOf(err as unknown as object, P.PrismaClientKnownRequestError.prototype);
  return err;
}

describe('ClientsController', () => {
  let controller: ClientsController;
  let service: MockClientsService;

  beforeEach(() => {
    service = {
      findAll: jest.fn<Promise<unknown>, [q?: string]>(),
      create: jest.fn<Promise<unknown>, [body: unknown]>(),
      delete: jest.fn<Promise<unknown>, [id: string]>(),
      findOne: jest.fn<Promise<unknown>, [id: string]>(),
      update: jest.fn<Promise<unknown>, [id: string, body: unknown]>(),
    };
    controller = new ClientsController(service as unknown as ClientsService);
  });

  it('index returns clients and q', async () => {
    service.findAll.mockResolvedValueOnce({ clients: [{ id: '1' }], total: 1 });
    const res = await controller.index('john');
    expect(service.findAll.mock.calls[0][0]).toBe('john');
    expect(res.clients).toEqual([{ id: '1' }]);
    expect(res.q).toEqual('john');
    expect(res.activeNav).toEqual('clients');
  });

  it('index maps unknown error to 500', async () => {
    service.findAll.mockRejectedValueOnce(new Error('boom'));
    await expect(controller.index()).rejects.toBeInstanceOf(InternalServerErrorException);
  });

  it('create calls service', async () => {
    service.create.mockResolvedValueOnce({ id: '1' });
    const res = await controller.create({ firstName: 'A', lastName: 'B', email: 'a@b.c' });
    expect(service.create.mock.calls.length).toBe(1);
    expect(res).toBeUndefined();
  });

  it('remove success returns void', async () => {
    service.delete.mockResolvedValueOnce({ id: '1' });
    await expect(controller.remove('1')).resolves.toBeUndefined();
    expect(service.delete.mock.calls[0][0]).toBe('1');
  });

  it('remove maps P2003 to BadRequest', async () => {
    service.delete.mockRejectedValueOnce(prismaKnownError('P2003'));
    await expect(controller.remove('1')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('remove maps P2025 to BadRequest not found', async () => {
    service.delete.mockRejectedValueOnce(prismaKnownError('P2025'));
    await expect(controller.remove('1')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('remove maps unknown to 500', async () => {
    service.delete.mockRejectedValueOnce(new Error('x'));
    await expect(controller.remove('1')).rejects.toBeInstanceOf(InternalServerErrorException);
  });

  it('show returns client', async () => {
    service.findOne.mockResolvedValueOnce({ id: '2' });
    const res = await controller.show('2');
    expect(res).toEqual({ client: { id: '2' } });
  });

  it('show throws when not found', async () => {
    service.findOne.mockResolvedValueOnce(null);
    await expect(controller.show('2')).rejects.toBeInstanceOf(InternalServerErrorException);
  });

  it('editForm returns client', async () => {
    service.findOne.mockResolvedValueOnce({ id: '3' });
    const res = await controller.editForm('3');
    expect(res).toEqual({ client: { id: '3' } });
  });

  it('editForm throws when not found', async () => {
    service.findOne.mockResolvedValueOnce(null);
    await expect(controller.editForm('3')).rejects.toBeInstanceOf(InternalServerErrorException);
  });

  it('update calls service', async () => {
    service.update.mockResolvedValueOnce({ id: '4' });
    const res = await controller.update('4', { firstName: 'Z' });
    expect(service.update.mock.calls[0]).toEqual(['4', { firstName: 'Z' }]);
    expect(res).toBeUndefined();
  });
});
