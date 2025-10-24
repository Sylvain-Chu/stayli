import { Controller, Get, Post, Req, Res, UseGuards, UseFilters } from '@nestjs/common';
import type { Response, Request } from 'express';
import { Public } from './public.decorator';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthExceptionFilter } from './auth-exception.filter';

@Controller('auth')
export class AuthController {
  @Public()
  @Get('login')
  loginForm(@Req() req: Request, @Res() res: Response) {
    const next = typeof req.query?.next === 'string' ? req.query.next : undefined;
    return res.render('auth/login', { title: 'Login', next });
  }

  @Public()
  @Post('login')
  @UseGuards(LocalAuthGuard)
  @UseFilters(AuthExceptionFilter)
  async login(@Req() req: Request, @Res() res: Response) {
    // Ensure req.login (passport) succeeds — if it fails, respond 500
    const r = req as Request & {
      login?: (user?: unknown, cb?: (err?: Error | null) => void) => void;
      user?: unknown;
    };

    if (typeof r.login === 'function') {
      try {
        await new Promise<void>((resolve, reject) => {
          try {
            const loginFn = r.login as unknown as (
              user: unknown,
              cb: (err: Error | null) => void,
            ) => void;
            loginFn(r.user, (err: Error | null) => {
              if (err) return reject(new Error(String(err)));
              resolve();
            });
          } catch (err) {
            return reject(new Error(String(err)));
          }
        });
      } catch {
        return res.status(500).send('Login failed');
      }
    }

    // If login succeeded (or no login function), redirect to next or home
    const body = req.body as Record<string, unknown>;
    const next = typeof body?.next === 'string' ? body.next : undefined;
    return res.redirect(next || '/');
  }

  @Post('logout')
  logout(@Req() req: Request, @Res() res: Response) {
    const r = req as Request & {
      logout?: (cb: (err?: unknown) => void) => void;
      session?: { destroy?: (cb: () => void) => void };
    };
    if (typeof r.logout === 'function') {
      r.logout((err?: unknown) => {
        if (err) return res.status(500).send('Logout failed');
        if (r.session && typeof r.session.destroy === 'function') {
          r.session.destroy(() => res.redirect('/auth/login'));
          return;
        }
        return res.redirect('/auth/login');
      });
      return;
    }
    return res.redirect('/auth/login');
  }
}
