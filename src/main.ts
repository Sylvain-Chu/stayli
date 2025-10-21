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
import * as fs from 'fs';
import { ValidationPipe } from '@nestjs/common';
import session from 'express-session';
import cookieParser from 'cookie-parser';
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
  // Pretty localized date: vendredi 10 octobre 2025 / Friday October 10, 2025
  hbs.registerHelper(
    'formatDate',
    function (this: { lang?: string }, value?: Date | string, pattern?: string) {
      if (!value) return '';
      const d = value instanceof Date ? value : new Date(value);
      if (Number.isNaN(d.getTime())) return '';
      try {
        const locale = this.lang === 'fr' ? fr : undefined;
        return format(d, pattern || 'EEEE d MMMM yyyy', { locale });
      } catch {
        return '';
      }
    },
  );
  // Relative time like "dans 3 jours" / "in 3 days"
  hbs.registerHelper('fromNow', function (this: { lang?: string }, value?: Date | string) {
    if (!value) return '';
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    try {
      const locale = this.lang === 'fr' ? fr : undefined;
      return formatDistanceToNow(d, { addSuffix: true, locale });
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

  // i18n translation helper for Handlebars templates
  // Be defensive about Handlebars runtime shapes: helpers can be called with
  // different arguments and the root context may be available as
  // options.data.root, this.data.root, or this._root depending on the runtime.
  // small in-memory cache to avoid re-reading translation files for each helper call
  const translationsCache: Record<string, Record<string, string>> = {};

  function flattenTranslations(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
    const result: Record<string, string> = {};
    const walk = (o: Record<string, unknown>, p: string) => {
      for (const k of Object.keys(o)) {
        const v = o[k];
        const nk = p ? `${p}.${k}` : k;
        if (v && typeof v === 'object' && !Array.isArray(v)) {
          walk(v as Record<string, unknown>, nk);
        } else {
          result[nk] = String(v ?? '');
        }
      }
    };
    walk(obj, prefix);
    return result;
  }

  function loadTranslationsFromFs(lang: string): Record<string, string> {
    if (translationsCache[lang]) return translationsCache[lang];
    const candidates = [
      join(__dirname, 'i18n'),
      join(__dirname, '..', 'i18n'),
      join(process.cwd(), 'src', 'i18n'),
      join(process.cwd(), 'dist', 'src', 'i18n'),
    ];
    const base = candidates.find((p) => existsSync(p));
    if (!base) return {};
    try {
      const filePath = join(base, lang, 'translation.json');
      if (!existsSync(filePath)) return {};
      const raw = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const flat = flattenTranslations(parsed);
      translationsCache[lang] = flat;
      return flat;
    } catch {
      return {};
    }
  }

  function isOptions(x: unknown): x is { data?: { root?: Record<string, unknown> } } {
    return typeof x === 'object' && x !== null && Object.prototype.hasOwnProperty.call(x, 'data');
  }

  hbs.registerHelper('t', function (this: unknown, key: string, ...rest: unknown[]) {
    const maybeOptions = rest.length ? rest[rest.length - 1] : undefined;

    let root: Record<string, unknown> | undefined;
    if (isOptions(maybeOptions)) root = maybeOptions.data?.root;
    if (!root && typeof this === 'object' && this !== null) {
      const t = this as Record<string, unknown>;
      if (t.data && typeof t.data === 'object' && (t.data as any).root)
        root = (t.data as any).root as Record<string, unknown>;
      else if ((t as any)._root) root = (t as any)._root as Record<string, unknown>;
    }

    const rootTranslations =
      root && 'translations' in root ? (root.translations as Record<string, unknown>) : undefined;
    const selfTranslations =
      typeof this === 'object' &&
      this !== null &&
      'translations' in (this as Record<string, unknown>)
        ? ((this as Record<string, unknown>).translations as Record<string, unknown>)
        : undefined;

    let translationsAny = rootTranslations || selfTranslations;

    // If no translations present in the template context, or it's an empty object,
    // try loading from fs cache. This avoids showing raw keys when middleware set
    // res.locals.translations = {}.
    if (!translationsAny || Object.keys(translationsAny).length === 0) {
      const lang = root && 'currentLang' in root ? String(root.currentLang) : 'en';
      translationsAny = loadTranslationsFromFs(lang);
    }

    const val = translationsAny ? translationsAny[key] : undefined;
    return typeof val === 'string' && val !== '' ? val : key;
  });

  // Attach body parsing and static asset serving to the underlying Express instance
  // so server-side forms still work and client JS can be served from /js.
  const server = app.getHttpAdapter().getInstance();
  server.use(cookieParser());
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

  // i18n middleware: inject translations into res.locals for Handlebars
  app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Get language from cookie, query param, or default to 'en'
    const cookieLang = typeof req.cookies?.lang === 'string' ? req.cookies.lang : undefined;
    const queryLang = typeof req.query.lang === 'string' ? req.query.lang : undefined;
    const lang = cookieLang || queryLang || 'en';
    const validLangs = ['en', 'fr'];
    const selectedLang = validLangs.includes(lang) ? lang : 'en';

    // Load translations dynamically from a computed i18n path (support src and dist)
    const candidates = [
      join(__dirname, 'i18n'),
      join(__dirname, '..', 'i18n'),
      join(process.cwd(), 'src', 'i18n'),
      join(process.cwd(), 'dist', 'src', 'i18n'),
    ];
    const i18nBase = candidates.find((p) => existsSync(p));

    if (!i18nBase) {
      (res.locals as Record<string, unknown>).translations = {};
      (res.locals as Record<string, unknown>).lang = 'en';
      (res.locals as Record<string, unknown>).currentLang = 'en';
      return next();
    }

    try {
      const filePath = join(i18nBase, selectedLang, 'translation.json');
      if (!existsSync(filePath)) throw new Error('missing translation file');
      const raw = fs.readFileSync(filePath, 'utf8');
      const translations = JSON.parse(raw) as Record<string, unknown>;

      const flatTranslations: Record<string, string> = {};
      const flatten = (obj: Record<string, unknown>, prefix = '') => {
        for (const key in obj) {
          const value = obj[key];
          const newKey = prefix ? `${prefix}.${key}` : key;
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            flatten(value as Record<string, unknown>, newKey);
          } else {
            flatTranslations[newKey] = String(value);
          }
        }
      };
      flatten(translations);

      (res.locals as Record<string, unknown>).translations = flatTranslations;
      (res.locals as Record<string, unknown>).lang = selectedLang;
      (res.locals as Record<string, unknown>).currentLang = selectedLang;
    } catch {
      (res.locals as Record<string, unknown>).translations = {};
      (res.locals as Record<string, unknown>).lang = 'en';
      (res.locals as Record<string, unknown>).currentLang = 'en';
    }
    next();
  });

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
