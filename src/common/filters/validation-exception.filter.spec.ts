import type { ArgumentsHost } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { ValidationExceptionFilter } from './validation-exception.filter';
import type { PrismaService } from 'src/prisma/prisma.service';

describe('ValidationExceptionFilter', () => {
  type TestResponse = {
    status: jest.Mock<TestResponse, [number]>;
    render: jest.Mock<void, [string, Record<string, unknown>]>;
    json: jest.Mock<void, [unknown]>;
  };
  type TestRequest = {
    method: string;
    path: string;
    originalUrl: string;
    body?: Record<string, unknown>;
  };
  type MinimalHttpSwitch = { getResponse: () => TestResponse; getRequest: () => TestRequest };
  type MinimalHost = { switchToHttp: () => MinimalHttpSwitch; _res: TestResponse };

  function makeCtx({
    method,
    path,
    body,
  }: {
    method: string;
    path: string;
    body?: Record<string, unknown>;
  }): MinimalHost {
    const req: TestRequest = {
      method,
      path,
      originalUrl: path,
      body,
    };
    const statusMock = jest.fn<TestResponse, [number]>();
    const renderMock = jest.fn<void, [string, Record<string, unknown>]>();
    const jsonMock = jest.fn<void, [unknown]>();
    const res: TestResponse = { status: statusMock, render: renderMock, json: jsonMock };
    statusMock.mockImplementation(() => res);
    return {
      switchToHttp: () => ({ getResponse: () => res, getRequest: () => req }),
      _res: res,
    };
  }

  it('re-renders bookings/create with properties and clients on POST', async () => {
    type MockPrisma = {
      property: { findMany: jest.Mock<Promise<unknown[]>, [unknown?]> };
      client: { findMany: jest.Mock<Promise<unknown[]>, [unknown?]> };
      booking: {
        findUnique: jest.Mock<Promise<{ id: string } | null>, [{ where: { id: string } }]>;
      };
    };
    const prisma: MockPrisma = {
      property: { findMany: jest.fn<Promise<unknown[]>, [unknown?]>() },
      client: { findMany: jest.fn<Promise<unknown[]>, [unknown?]>() },
      booking: {
        findUnique: jest.fn<Promise<{ id: string } | null>, [{ where: { id: string } }]>(),
      },
    };
    prisma.property.findMany.mockResolvedValue([{ id: 'p' }]);
    prisma.client.findMany.mockResolvedValue([{ id: 'c' }]);
    const filter = new ValidationExceptionFilter(prisma as unknown as PrismaService);
    const ex = new BadRequestException({ message: ['startDate must be a Date'] });
    const host = makeCtx({ method: 'POST', path: '/bookings/create', body: { foo: 'bar' } });
    let captured: Record<string, unknown> | undefined;
    host._res.render.mockImplementation((_view, locals) => {
      captured = locals;
    });
    await filter.catch(ex, host as unknown as ArgumentsHost);
    expect(host._res.render).toHaveBeenCalledWith('bookings/create', expect.any(Object));
    expect(captured).toMatchObject({
      payload: { foo: 'bar' },
      properties: [{ id: 'p' }],
      clients: [{ id: 'c' }],
    });
    // errors should be an array of strings
    const errs = (captured as { errors?: unknown }).errors;
    expect(Array.isArray(errs)).toBe(true);
    if (Array.isArray(errs)) {
      expect((errs as unknown[]).every((e) => typeof e === 'string')).toBe(true);
    }
  });

  it('re-renders bookings/edit and includes booking when found', async () => {
    type MockPrisma = {
      property: { findMany: jest.Mock<Promise<unknown[]>, [unknown?]> };
      client: { findMany: jest.Mock<Promise<unknown[]>, [unknown?]> };
      booking: {
        findUnique: jest.Mock<Promise<{ id: string } | null>, [{ where: { id: string } }]>;
      };
    };
    const prisma: MockPrisma = {
      property: { findMany: jest.fn<Promise<unknown[]>, [unknown?]>().mockResolvedValue([]) },
      client: { findMany: jest.fn<Promise<unknown[]>, [unknown?]>().mockResolvedValue([]) },
      booking: {
        findUnique: jest
          .fn<Promise<{ id: string } | null>, [{ where: { id: string } }]>()
          .mockResolvedValue({ id: 'b1' }),
      },
    };
    const filter = new ValidationExceptionFilter(prisma as unknown as PrismaService);
    const ex = new BadRequestException('Invalid input');
    const host = makeCtx({ method: 'POST', path: '/bookings/abc/edit', body: {} });
    let captured: Record<string, unknown> | undefined;
    host._res.render.mockImplementation((_view, locals) => {
      captured = locals;
    });
    await filter.catch(ex, host as unknown as ArgumentsHost);
    expect(captured).toMatchObject({ booking: { id: 'b1' } });
  });

  it('bookings/edit without booking still renders without booking in locals', async () => {
    const prisma = {
      property: { findMany: jest.fn<Promise<unknown[]>, [unknown?]>().mockResolvedValue([]) },
      client: { findMany: jest.fn<Promise<unknown[]>, [unknown?]>().mockResolvedValue([]) },
      booking: {
        findUnique: jest
          .fn<Promise<{ id: string } | null>, [{ where: { id: string } }]>()
          .mockResolvedValue(null),
      },
    } as const;
    const filter = new ValidationExceptionFilter(prisma as unknown as PrismaService);
    const ex = new BadRequestException({ message: ['x'] });
    const host = makeCtx({ method: 'POST', path: '/bookings/abc/edit', body: {} });
    let captured: Record<string, unknown> | undefined;
    host._res.render.mockImplementation((_view, locals) => {
      captured = locals;
    });
    await filter.catch(ex, host as unknown as ArgumentsHost);
    expect(host._res.render).toHaveBeenCalledWith('bookings/edit', expect.any(Object));
    expect(captured).toBeDefined();
    if (captured) {
      expect('booking' in captured).toBe(false);
    }
  });

  it('renders inferred view for non-bookings POST', async () => {
    const prisma = {
      property: { findMany: jest.fn<Promise<unknown[]>, [unknown?]>() },
      client: { findMany: jest.fn<Promise<unknown[]>, [unknown?]>() },
      booking: {
        findUnique: jest.fn<Promise<{ id: string } | null>, [{ where: { id: string } }]>(),
      },
    } as const;
    const filter = new ValidationExceptionFilter(prisma as unknown as PrismaService);
    const ex = new BadRequestException('Nope');
    const host = makeCtx({ method: 'POST', path: '/clients/create', body: { a: 1 } });
    await filter.catch(ex, host as unknown as ArgumentsHost);
    expect(host._res.render).toHaveBeenCalledWith('clients/create', expect.any(Object));
  });

  it('falls back to render on bookings view when any enrichment promise rejects', async () => {
    // Reset static cache to force DB calls
    (ValidationExceptionFilter as unknown as { _cache: unknown })._cache = {} as unknown;
    const prisma = {
      property: {
        findMany: jest.fn<Promise<unknown[]>, [unknown?]>().mockRejectedValue(new Error('db')),
      },
      client: { findMany: jest.fn<Promise<unknown[]>, [unknown?]>().mockResolvedValue([]) },
      booking: {
        findUnique: jest
          .fn<Promise<{ id: string } | null>, [{ where: { id: string } }]>()
          .mockResolvedValue(null),
      },
    } as const;
    const filter = new ValidationExceptionFilter(prisma as unknown as PrismaService);
    const ex = new BadRequestException({ message: ['bad'] });
    const host = makeCtx({ method: 'POST', path: '/bookings/create', body: {} });
    await filter.catch(ex, host as unknown as ArgumentsHost);
    // should still render bookings/create despite rejection
    expect(host._res.render).toHaveBeenCalledWith('bookings/create', expect.any(Object));
  });

  it('parses string error message when raw getResponse is a string', async () => {
    const prisma = {
      property: { findMany: jest.fn<Promise<unknown[]>, [unknown?]>() },
      client: { findMany: jest.fn<Promise<unknown[]>, [unknown?]>() },
      booking: {
        findUnique: jest.fn<Promise<{ id: string } | null>, [{ where: { id: string } }]>(),
      },
    } as const;
    const filter = new ValidationExceptionFilter(prisma as unknown as PrismaService);
    const fakeEx = {
      getStatus: () => 400,
      message: 'ignored',
      getResponse: () => 'raw string',
    } as unknown as BadRequestException;
    const host = makeCtx({ method: 'POST', path: '/clients/create', body: {} });
    let locals: Record<string, unknown> | undefined;
    host._res.render.mockImplementation((_v, l) => {
      locals = l;
    });
    await filter.catch(fakeEx, host as unknown as ArgumentsHost);
    expect(locals).toBeDefined();
    if (locals) {
      const errs = (locals as { errors?: unknown }).errors;
      expect(Array.isArray(errs)).toBe(true);
      if (Array.isArray(errs)) expect(errs[0]).toBe('raw string');
    }
  });

  it('infers single-segment view and falls back to exception.message when no message array', async () => {
    const prisma = {
      property: { findMany: jest.fn<Promise<unknown[]>, [unknown?]>() },
      client: { findMany: jest.fn<Promise<unknown[]>, [unknown?]>() },
      booking: {
        findUnique: jest.fn<Promise<{ id: string } | null>, [{ where: { id: string } }]>(),
      },
    } as const;
    const filter = new ValidationExceptionFilter(prisma as unknown as PrismaService);
    const fakeEx = {
      getStatus: () => 400,
      message: 'Validation failed (custom)',
      getResponse: () => ({ foo: 'bar' }),
    } as unknown as BadRequestException;
    const host = makeCtx({ method: 'POST', path: '/foo', body: {} });
    let locals: Record<string, unknown> | undefined;
    host._res.render.mockImplementation((_v, l) => {
      locals = l;
    });
    await filter.catch(fakeEx, host as unknown as ArgumentsHost);
    expect(host._res.render).toHaveBeenCalledWith('foo', expect.any(Object));
    if (locals) {
      const errs = (locals as { errors?: unknown }).errors;
      expect(Array.isArray(errs)).toBe(true);
      if (Array.isArray(errs)) expect(errs[0]).toBe('Validation failed (custom)');
    }
  });

  it('non-POST JSON maps object with message array to errors', async () => {
    const prisma = {
      property: { findMany: jest.fn<Promise<unknown[]>, [unknown?]>() },
      client: { findMany: jest.fn<Promise<unknown[]>, [unknown?]>() },
      booking: {
        findUnique: jest.fn<Promise<{ id: string } | null>, [{ where: { id: string } }]>(),
      },
    } as const;
    const filter = new ValidationExceptionFilter(prisma as unknown as PrismaService);
    const fakeEx = {
      getStatus: () => 400,
      message: 'noop',
      getResponse: () => ({ message: ['a', 'b'] }),
    } as unknown as BadRequestException;
    const host = makeCtx({ method: 'GET', path: '/x', body: {} });
    await filter.catch(fakeEx, host as unknown as ArgumentsHost);
    const jsonCalls = (host._res.json as unknown as jest.Mock).mock.calls as Array<[any]>;
    expect(jsonCalls[0][0]).toMatchObject({ errors: ['a', 'b'] });
  });

  it('non-POST returns JSON with undefined errors for unexpected getResponse', async () => {
    const prisma = {
      property: { findMany: jest.fn<Promise<unknown[]>, [unknown?]>() },
      client: { findMany: jest.fn<Promise<unknown[]>, [unknown?]>() },
      booking: {
        findUnique: jest.fn<Promise<{ id: string } | null>, [{ where: { id: string } }]>(),
      },
    } as const;
    const filter = new ValidationExceptionFilter(prisma as unknown as PrismaService);
    const fakeEx = {
      getStatus: () => 400,
      message: 'weird',
      getResponse: () => 1234, // neither string nor object
    } as unknown as BadRequestException;
    const host = makeCtx({ method: 'GET', path: '/whatever', body: {} });
    await filter.catch(fakeEx, host as unknown as ArgumentsHost);
    const jsonCalls = (host._res.json as unknown as jest.Mock).mock.calls as Array<[any]>;
    expect(jsonCalls[0][0]).toMatchObject({ statusCode: 400 });
    expect('errors' in jsonCalls[0][0]).toBe(true);
    expect((jsonCalls[0][0] as { errors?: unknown }).errors).toBeUndefined();
  });

  it('non-POST returns JSON', async () => {
    const prisma = {
      property: { findMany: jest.fn<Promise<unknown[]>, [unknown?]>() },
      client: { findMany: jest.fn<Promise<unknown[]>, [unknown?]>() },
      booking: {
        findUnique: jest.fn<Promise<{ id: string } | null>, [{ where: { id: string } }]>(),
      },
    } as const;
    const filter = new ValidationExceptionFilter(prisma as unknown as PrismaService);
    const ex = new BadRequestException('Bad');
    const host = makeCtx({ method: 'GET', path: '/whatever', body: {} });
    await filter.catch(ex, host as unknown as ArgumentsHost);
    expect(host._res.json).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  });
});
