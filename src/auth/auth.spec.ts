import { Reflector } from '@nestjs/core';
import { AuthenticatedGuard } from './authenticated.guard';
import { LocalStrategy } from './local.strategy';
import type { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

type MockCtx = {
  switchToHttp: () => { getRequest: () => unknown; getResponse: () => unknown };
  getHandler: () => unknown;
  getClass: () => unknown;
  _res: { redirect: jest.Mock<void, [string]> };
};

function mockExecutionContext({
  isAuthenticated,
  url = '/secret',
}: {
  isAuthenticated?: boolean;
  url?: string;
}): MockCtx {
  const req = {
    originalUrl: url,
    isAuthenticated: typeof isAuthenticated === 'boolean' ? () => isAuthenticated : undefined,
  } as unknown as { originalUrl: string; isAuthenticated?: () => boolean };
  const res = { redirect: jest.fn<void, [string]>() };
  const ctx: MockCtx = {
    switchToHttp: () => ({ getRequest: () => req, getResponse: () => res }),
    getHandler: () => ({}),
    getClass: () => ({}),
    _res: res,
  };
  return ctx;
}

describe('Auth module pieces', () => {
  it('AuthenticatedGuard allows public routes', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(true),
    } as unknown as Reflector;
    const guard = new AuthenticatedGuard(reflector);
    const ctx = mockExecutionContext({});
    expect(guard.canActivate(ctx as unknown as never)).toBe(true);
  });

  it('AuthenticatedGuard redirects unauthenticated user to login with next', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(false),
    } as unknown as Reflector;
    const guard = new AuthenticatedGuard(reflector);
    const ctx = mockExecutionContext({ isAuthenticated: false, url: '/x?a=1' });
    expect(guard.canActivate(ctx as unknown as never)).toBe(false);
    expect(ctx._res.redirect).toHaveBeenCalledWith('/auth/login?next=%2Fx%3Fa%3D1');
  });

  it('AuthenticatedGuard allows authenticated user', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(false),
    } as unknown as Reflector;
    const guard = new AuthenticatedGuard(reflector);
    const ctx = mockExecutionContext({ isAuthenticated: true });
    expect(guard.canActivate(ctx as unknown as never)).toBe(true);
  });

  it('LocalStrategy validate delegates to AuthService', async () => {
    const authService = {
      validate: jest.fn().mockResolvedValue({ id: 'u', email: 'e', role: 'r' }),
    } as unknown as AuthService;
    const strategy = new LocalStrategy(authService);
    const res = await strategy.validate('e', 'p');
    expect(res).toEqual({ id: 'u', email: 'e', role: 'r' });
  });

  describe('AuthController', () => {
    it('loginForm renders with next', () => {
      const controller = new AuthController();
      const req = { query: { next: '/x' } } as unknown as Parameters<
        AuthController['loginForm']
      >[0];
      const res = { render: jest.fn() } as unknown as Parameters<AuthController['loginForm']>[1];
      controller.loginForm(req, res);
      const call = ((res.render as unknown as jest.Mock).mock.calls[0] as [string, unknown])[1];
      expect(call).toMatchObject({ title: 'Login', next: '/x' });
    });

    it('login handles req.login callback and next param', () => {
      const controller = new AuthController();
      const res = {
        redirect: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as unknown as Parameters<AuthController['login']>[1];
      const req = {
        body: { next: '/dash' },
        user: { id: 'u' },
        login: (u: unknown, cb: (err?: unknown) => void) => cb(),
      } as unknown as Parameters<AuthController['login']>[0];
      controller.login(req, res);
      const redirectCalls = (res.redirect as unknown as jest.Mock).mock.calls as Array<[string]>;
      expect(redirectCalls[0][0]).toBe('/dash');
    });

    it('logout uses session.destroy when present', () => {
      const controller = new AuthController();
      const res = {
        redirect: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as unknown as Parameters<AuthController['logout']>[1];
      const req = {
        logout: (cb: (err?: unknown) => void) => cb(),
        session: { destroy: (cb: () => void) => cb() },
      } as unknown as Parameters<AuthController['logout']>[0];
      controller.logout(req, res);
      const logoutRedirectCalls = (res.redirect as unknown as jest.Mock).mock.calls as Array<
        [string]
      >;
      expect(logoutRedirectCalls[0][0]).toBe('/auth/login');
    });

    it('login handles req.login callback error', () => {
      const controller = new AuthController();
      const res = {
        redirect: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as unknown as Parameters<AuthController['login']>[1];
      const req = {
        body: {},
        user: { id: 'u' },
        login: (u: unknown, cb: (err?: unknown) => void) => cb(new Error('fail')),
      } as unknown as Parameters<AuthController['login']>[0];
      controller.login(req, res);
      const statusCalls = (res.status as unknown as jest.Mock).mock.calls as Array<[number]>;
      const sendCalls = (res.send as unknown as jest.Mock).mock.calls as Array<[string]>;
      expect(statusCalls[0][0]).toBe(500);
      expect(sendCalls[0][0]).toBe('Login failed');
    });

    it('login without req.login falls back to redirect', () => {
      const controller = new AuthController();
      const res = {
        redirect: jest.fn(),
      } as unknown as Parameters<AuthController['login']>[1];
      const req = {
        body: { next: '/n' },
        user: { id: 'u' },
      } as unknown as Parameters<AuthController['login']>[0];
      controller.login(req, res);
      const redirectCalls2 = (res.redirect as unknown as jest.Mock).mock.calls as Array<[string]>;
      expect(redirectCalls2[0][0]).toBe('/n');
    });

    it('logout handles error from logout callback', () => {
      const controller = new AuthController();
      const res = {
        redirect: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as unknown as Parameters<AuthController['logout']>[1];
      const req = {
        logout: (cb: (err?: unknown) => void) => cb(new Error('x')),
      } as unknown as Parameters<AuthController['logout']>[0];
      controller.logout(req, res);
      const statusCalls2 = (res.status as unknown as jest.Mock).mock.calls as Array<[number]>;
      const sendCalls2 = (res.send as unknown as jest.Mock).mock.calls as Array<[string]>;
      expect(statusCalls2[0][0]).toBe(500);
      expect(sendCalls2[0][0]).toBe('Logout failed');
    });

    it('logout without logout function redirects', () => {
      const controller = new AuthController();
      const res = {
        redirect: jest.fn(),
      } as unknown as Parameters<AuthController['logout']>[1];
      const req = {} as unknown as Parameters<AuthController['logout']>[0];
      controller.logout(req, res);
      const logoutRedirectCalls2 = (res.redirect as unknown as jest.Mock).mock.calls as Array<
        [string]
      >;
      expect(logoutRedirectCalls2[0][0]).toBe('/auth/login');
    });

    it('logout redirects when session.destroy missing', () => {
      const controller = new AuthController();
      const res = {
        redirect: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as unknown as Parameters<AuthController['logout']>[1];
      const req = {
        logout: (cb: (err?: unknown) => void) => cb(),
        // session object present but without destroy function
        session: {},
      } as unknown as Parameters<AuthController['logout']>[0];
      controller.logout(req, res);
      const calls = (res.redirect as unknown as jest.Mock).mock.calls as Array<[string]>;
      expect(calls[0][0]).toBe('/auth/login');
    });
  });
});
