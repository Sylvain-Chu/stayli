import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Call the parent canActivate which triggers the strategy validation
    const result = (await super.canActivate(context)) as boolean;

    // If validation succeeds, manually call login to establish session
    const request = context.switchToHttp().getRequest<Request>();
    await super.logIn(request);

    return result;
  }

  // Override handleRequest to throw UnauthorizedException instead of default 401/403
  handleRequest<TUser = Express.User>(err: unknown, user: TUser | false): TUser {
    // If there's an error or no user, throw UnauthorizedException
    // This will be caught by our AuthExceptionFilter
    if (err || !user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return user as TUser;
  }
}
