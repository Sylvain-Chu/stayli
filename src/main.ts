import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { existsSync } from 'fs';
import * as dotenv from 'dotenv';
// hbs types are minimal; define a narrow interface for helpers we use
import hbsDefault from 'hbs';
interface HbsApi {
  registerPartials: (path: string) => void;
  registerHelper: (name: string, fn: (...args: unknown[]) => unknown) => void;
}
const hbs = hbsDefault as unknown as HbsApi;
// Load env from .env.local if present, otherwise fallback to .env
const localEnv = join(process.cwd(), '.env.local');
if (existsSync(localEnv)) {
  dotenv.config({ path: localEnv });
} else {
  dotenv.config();
}
import * as express from 'express';
import { ValidationPipe } from '@nestjs/common';
import session from 'express-session';
import { ValidationExceptionFilter } from './common/filters/validation-exception.filter';
import { format, isToday as isTodayFn, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Support multiple possible locations for Handlebars templates so the app
  // works both when running from source (mounted src/views) and when
  // running built artifacts in dist. We choose the first existing path.
  const candidates = [
    join(process.cwd(), 'src', 'views'),
    join(__dirname, '..', 'src', 'views'),
    join(__dirname, '..', 'views'),
    join(__dirname, 'views'),
    join(process.cwd(), 'dist', 'src', 'views'),
  ];
  const viewsDir = candidates.find((p) => existsSync(p));
  if (!viewsDir) {
    // Fallback to previous behavior; this will cause a clear error if none found
    app.setBaseViewsDir(join(__dirname, '..', 'src', 'views'));
  } else {
    app.setBaseViewsDir(viewsDir);
  }
  app.setViewEngine('hbs');
  // Register partials for shared layout components (header/sidebar/footer)
  if (viewsDir && existsSync(join(viewsDir, 'partials'))) {
    hbs.registerPartials(join(viewsDir, 'partials'));
  }
  // Register useful Handlebars helpers
  hbs.registerHelper('date', function (value?: Date | string) {
    if (!value) return '';
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  // Pretty localized date: vendredi 10 octobre 2025
  hbs.registerHelper('formatDate', function (value?: Date | string, pattern?: string) {
    if (!value) return '';
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    try {
      return format(d, pattern || 'EEEE d MMMM yyyy', { locale: fr });
    } catch {
      return '';
    }
  });
  // Relative time like "dans 3 jours" or "il y a 2 jours"
  hbs.registerHelper('fromNow', function (value?: Date | string) {
    if (!value) return '';
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    try {
      return formatDistanceToNow(d, { addSuffix: true, locale: fr });
    } catch {
      return '';
    }
  });
  // Today helper to conditionally render special styles
  hbs.registerHelper('isToday', function (value?: Date | string) {
    if (!value) return false;
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return false;
    return isTodayFn(d);
  });
  // Currency helper (EUR by default)
  const eur = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
  hbs.registerHelper('currency', function (value?: number) {
    if (typeof value !== 'number' || !Number.isFinite(value)) return '';
    return eur.format(value);
  });
  // Simple equality helper for select preselection
  hbs.registerHelper('eq', function (a: unknown, b: unknown) {
    // strict equality is fine for ids/strings used in templates
    return a === b;
  });
  // Current year helper for footer
  hbs.registerHelper('year', function () {
    return new Date().getFullYear();
  });
  // Repeat N times helper (for rendering leading blank cells in calendar)
  hbs.registerHelper('times', function (n: unknown, block: { fn: (i: number) => string }) {
    const count = typeof n === 'number' ? n : Number(n);
    let out = '';
    for (let i = 0; i < (Number.isFinite(count) ? count : 0); i++) {
      out += block.fn(i);
    }
    return out;
  });
  // Logical OR helper for templates
  hbs.registerHelper('or', function (a: unknown, b: unknown) {
    return a ?? b;
  });
  // Attach body parsing and static asset serving to the underlying Express instance
  // so server-side forms still work and client JS can be served from /js.
  const server = app.getHttpAdapter().getInstance();
  server.use(express.urlencoded({ extended: true }));
  server.use(express.static(join(process.cwd(), 'public')));

  // Sessions and Passport initialization
  const sessionMiddleware = session as unknown as (
    options: session.SessionOptions,
  ) => express.RequestHandler;
  server.use(
    sessionMiddleware({
      secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 1000 * 60 * 60 * 8 }, // 8 hours
    }),
  );
  // Load passport via dynamic import with default fallback (CJS/ESM interop)
  const passportMod = (await import('passport')) as
    | {
        default: {
          initialize: () => express.RequestHandler;
          session: () => express.RequestHandler;
        };
      }
    | { initialize: () => express.RequestHandler; session: () => express.RequestHandler };
  const passport = ('default' in passportMod ? passportMod.default : passportMod) as {
    initialize: () => express.RequestHandler;
    session: () => express.RequestHandler;
  };
  server.use(passport.initialize());
  server.use(passport.session());
  // Expose current user to templates
  app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Attach to res.locals for hbs
    (res.locals as Record<string, unknown>).user = (req as unknown as { user?: unknown }).user;
    next();
  });

  // Global validation (DTOs) and form error handling
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(app.get(ValidationExceptionFilter));

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
