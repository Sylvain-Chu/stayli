import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PropertiesController } from './properties.controller';
import type { PropertiesService } from './properties.service';
import { Prisma } from '@prisma/client';
import type { CreatePropertyDto } from './dto/create-property.dto';
import type { UpdatePropertyDto } from './dto/update-property.dto';

type MockPropertiesService = {
  findAll: jest.Mock<Promise<unknown>, [q?: string]>;
  create: jest.Mock<Promise<unknown>, [body: CreatePropertyDto]>;
  delete: jest.Mock<Promise<unknown>, [id: string]>;
  findOne: jest.Mock<Promise<unknown>, [id: string]>;
  update: jest.Mock<Promise<unknown>, [id: string, body: UpdatePropertyDto]>;
};

function prismaKnownError(code: string) {
  const err = new Error(code) as unknown as { code: string };
  err.code = code;
  const P = Prisma as unknown as { PrismaClientKnownRequestError: { prototype: object } };
  Object.setPrototypeOf(err as unknown as object, P.PrismaClientKnownRequestError.prototype);
  return err;
}

describe('PropertiesController', () => {
  let controller: PropertiesController;
  let service: MockPropertiesService;

  beforeEach(() => {
    service = {
      findAll: jest.fn<Promise<unknown>, [q?: string]>(),
      create: jest.fn<Promise<unknown>, [body: CreatePropertyDto]>(),
      delete: jest.fn<Promise<unknown>, [id: string]>(),
      findOne: jest.fn<Promise<unknown>, [id: string]>(),
      update: jest.fn<Promise<unknown>, [id: string, body: UpdatePropertyDto]>(),
    };
    controller = new PropertiesController(service as unknown as PropertiesService);
  });

  it('root returns properties and q', async () => {
    service.findAll.mockResolvedValueOnce({ properties: [{ id: '1' }], total: 1 });
    const res = await controller.root('villa');
    expect(service.findAll.mock.calls[0][0]).toBe('villa');
    expect(res.properties).toEqual([{ id: '1' }]);
    expect(res.q).toEqual('villa');
    expect(res.activeNav).toEqual('properties');
  });

  it('root maps unknown error to 500', async () => {
    service.findAll.mockRejectedValueOnce(new Error('boom'));
    await expect(controller.root()).rejects.toBeInstanceOf(InternalServerErrorException);
  });

  it('create calls service', async () => {
    service.create.mockResolvedValueOnce({ id: '1' });
    const res = await controller.create({ name: 'A' });
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

  it('show returns property', async () => {
    service.findOne.mockResolvedValueOnce({ id: '2' });
    const res = await controller.show('2');
    expect(res).toEqual({ property: { id: '2' } });
  });

  it('show throws when not found', async () => {
    service.findOne.mockResolvedValueOnce(null);
    await expect(controller.show('2')).rejects.toBeInstanceOf(InternalServerErrorException);
  });

  it('editForm returns property', async () => {
    service.findOne.mockResolvedValueOnce({ id: '3' });
    const res = await controller.editForm('3');
    expect(res).toEqual({ property: { id: '3' } });
  });

  it('editForm throws when not found', async () => {
    service.findOne.mockResolvedValueOnce(null);
    await expect(controller.editForm('3')).rejects.toBeInstanceOf(InternalServerErrorException);
  });

  it('update calls service', async () => {
    service.update.mockResolvedValueOnce({ id: '4' });
    const res = await controller.update('4', { name: 'Z' });
    expect(service.update.mock.calls[0]).toEqual(['4', { name: 'Z' }]);
    expect(res).toBeUndefined();
  });
});
