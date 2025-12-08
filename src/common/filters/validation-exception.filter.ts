import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  Injectable,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Catch(BadRequestException)
@Injectable()
export class ValidationExceptionFilter implements ExceptionFilter {
  constructor(private readonly prisma: PrismaService) {}
  // Simple in-memory cache for lookup tables to avoid DB queries on unrelated validation errors
  private static _cache: {
    properties?: { ts: number; value: unknown };
    clients?: { ts: number; value: unknown };
  } = {};
  private static CACHE_TTL = 1000 * 60 * 5; // 5 minutes

  private async getCachedProperties() {
    const now = Date.now();
    if (
      ValidationExceptionFilter._cache.properties &&
      now - ValidationExceptionFilter._cache.properties.ts < ValidationExceptionFilter.CACHE_TTL
    ) {
      return ValidationExceptionFilter._cache.properties.value;
    }
    const properties = await this.prisma.property.findMany({ orderBy: { name: 'asc' } });
    ValidationExceptionFilter._cache.properties = { ts: now, value: properties };
    return properties;
  }

  private async getCachedClients() {
    const now = Date.now();
    if (
      ValidationExceptionFilter._cache.clients &&
      now - ValidationExceptionFilter._cache.clients.ts < ValidationExceptionFilter.CACHE_TTL
    ) {
      return ValidationExceptionFilter._cache.clients.value;
    }
    const clients = await this.prisma.client.findMany({
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });
    ValidationExceptionFilter._cache.clients = { ts: now, value: clients };
    return clients;
  }
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const payload: Record<string, unknown> = (request.body as Record<string, unknown>) || {};

    // Try to infer a view name from the URL: e.g., /bookings/create -> bookings/create
    const path = request.path || '';
    const method = request.method.toUpperCase();

    // API routes that should return JSON, not render views
    const apiRoutes = ['/bookings/calculate-price', '/bookings/events'];
    const isApiRoute = apiRoutes.some((route) => path.includes(route));

    // Only attempt to re-render on form submissions (POST) and not API routes
    if (method === 'POST' && !isApiRoute) {
      // Strip leading slash
      let view = path.startsWith('/') ? path.slice(1) : path;
      const url = (request.originalUrl || '').split('?')[0];
      const parts = url.split('/').filter(Boolean);
      // Normalize to first two segments when possible (e.g., bookings/create or bookings/edit)
      if (parts.length >= 2) {
        // For dynamic like /bookings/:id/edit -> convert to bookings/edit
        const seg0 = parts[0];
        const seg1 = parts[1];
        const seg2 = parts[2];
        if (seg2 === 'edit') {
          view = `${seg0}/edit`;
        } else {
          view = `${seg0}/${seg1}`;
        }
      }

      const message = exception.message || 'Validation failed';
      // Nest default BadRequestException with class-validator uses response with message array
      const raw = exception.getResponse();
      let errors: string[] = [];
      if (typeof raw === 'string') {
        errors = [raw];
      } else if (typeof raw === 'object' && raw) {
        const maybe = raw as { message?: string | string[] };
        if (Array.isArray(maybe.message))
          errors = maybe.message.filter((v): v is string => typeof v === 'string');
        else if (typeof maybe.message === 'string') errors = [maybe.message];
      }
      if (errors.length === 0) errors = [message];

      // Enrich locals depending on the view to ensure selects are populated
      const locals: Record<string, unknown> = { errors, payload };
      if (view.startsWith('bookings/')) {
        // For bookings create/edit forms we need properties and clients
        // Use cached lookups to avoid DB queries on unrelated validation errors
        const maybeId = parts.length >= 2 ? parts[1] : undefined;
        const clientsPromise = this.getCachedClients();
        const propertiesPromise = this.getCachedProperties();
        const bookingPromise =
          view === 'bookings/edit' && maybeId
            ? this.prisma.booking.findUnique({ where: { id: maybeId } })
            : Promise.resolve(null);

        return Promise.all([propertiesPromise, clientsPromise, bookingPromise])
          .then(([properties, clients, booking]) => {
            locals.properties = properties;
            locals.clients = clients;
            if (booking) locals.booking = booking;
            return response.status(status).render(view, locals);
          })
          .catch(() => response.status(status).render(view, locals));
      }

      // Render the inferred view with errors and the payload to refill fields
      return response.status(status).render(view, locals);
    }

    return response.status(status).json({
      statusCode: status,
      message: exception.message || 'Bad Request',
      errors: ((): string | string[] | undefined => {
        const raw = exception.getResponse();
        if (typeof raw === 'string') return raw;
        if (raw && typeof raw === 'object') {
          const maybe = raw as { message?: string | string[] };
          return maybe.message;
        }
        return undefined;
      })(),
    });
  }
}
