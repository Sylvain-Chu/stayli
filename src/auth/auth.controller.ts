import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Response, Request } from 'express';
import { Public } from './public.decorator';
import { LocalAuthGuard } from './local-auth.guard';

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
  login(@Req() req: Request, @Res() res: Response) {
    // Explicitly call req.login to ensure the session is persisted
    const body = req.body as Record<string, unknown>;
    const next = typeof body?.next === 'string' ? body.next : undefined;
    const r = req as Request & {
      login?: (user: unknown, cb: (err?: unknown) => void) => void;
    } & { user?: unknown };
    if (typeof r.login === 'function' && r.user) {
      r.login(r.user, (err?: unknown) => {
        if (err) return res.status(500).send('Login failed');
        return res.redirect(next || '/');
      });
      return; // response handled in callback
    }
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
