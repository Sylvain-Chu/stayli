import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.decorator';
import type { Response, Request } from 'express';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    const req = context.switchToHttp().getRequest<Request & { isAuthenticated?: () => boolean }>();
    const isAuth = typeof req.isAuthenticated === 'function' ? req.isAuthenticated() : false;
    if (!isAuth) {
      const res = context.switchToHttp().getResponse<Response>();
      const nextUrl = encodeURIComponent(req.originalUrl || '/');
      res.redirect(`/auth/login?next=${nextUrl}`);
      return false;
    }
    return true;
  }
}
