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
  login(@Req() req: Request, @Res() res: Response) {
    // Ensure req.login (passport) succeeds — if it fails, respond 500.
    // Use a callback-style invocation so that synchronous test doubles work.
    const r = req as Request & {
      login?: (user?: unknown, cb?: (err?: Error | null) => void) => void;
      user?: unknown;
    };

    const body = req.body as Record<string, unknown>;
    const next = typeof body?.next === 'string' ? body.next : undefined;

    if (typeof r.login === 'function') {
      try {
        const loginFn = r.login as unknown as (
          user: unknown,
          cb: (err: Error | null) => void,
        ) => void;
        // Call login and handle result in callback synchronously if the implementation is sync.
        loginFn(r.user, (err: Error | null) => {
          if (err) return res.status(500).send('Login failed');
          return res.redirect(next || '/');
        });
      } catch {
        return res.status(500).send('Login failed');
      }
      return;
    }

    // If no req.login, just redirect synchronously
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
