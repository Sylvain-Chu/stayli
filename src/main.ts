import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { existsSync } from 'fs';
import * as dotenv from 'dotenv';
// hbs types are minimal; use default import with any to avoid TS complaints
import hbsDefault from 'hbs';
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const hbs: any = hbsDefault as any;
// Load env from .env.local if present, otherwise fallback to .env
const localEnv = join(process.cwd(), '.env.local');
if (existsSync(localEnv)) {
  dotenv.config({ path: localEnv });
} else {
  dotenv.config();
}
import * as express from 'express';
import { ValidationPipe } from '@nestjs/common';

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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    hbs.registerPartials(join(viewsDir, 'partials'));
  }
  // Register useful Handlebars helpers
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  hbs.registerHelper('date', function (value?: Date | string) {
    if (!value) return '';
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  // Simple equality helper for select preselection
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  hbs.registerHelper('eq', function (a: unknown, b: unknown) {
    // strict equality is fine for ids/strings used in templates
    return a === b;
  });
  // Current year helper for footer
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  hbs.registerHelper('year', function () {
    return new Date().getFullYear();
  });
  // Attach body parsing and static asset serving to the underlying Express instance
  // so server-side forms still work and client JS can be served from /js.
  const server = app.getHttpAdapter().getInstance();
  server.use(express.urlencoded({ extended: true }));
  server.use(express.static(join(process.cwd(), 'public')));

  // Global validation (DTOs)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
