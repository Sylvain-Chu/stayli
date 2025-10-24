import { ExceptionFilter, Catch, ArgumentsHost, UnauthorizedException } from '@nestjs/common';
import type { Response, Request } from 'express';

@Catch(UnauthorizedException)
export class AuthExceptionFilter implements ExceptionFilter {
  catch(exception: UnauthorizedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Extract 'next' param from body (POST login) or query (GET)
    const body = request.body as Record<string, unknown>;
    const query = request.query as Record<string, unknown>;
    const next =
      typeof body?.next === 'string'
        ? body.next
        : typeof query?.next === 'string'
          ? query.next
          : undefined;

    // Render login page with error message and 401 status
    response.status(401).render('auth/login', {
      title: 'Login',
      next,
      error: 'Invalid email or password. Please try again.',
    });
  }
}
