import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { existsSync } from 'fs';
import * as dotenv from 'dotenv';
import * as express from 'express';
import { ValidationPipe } from '@nestjs/common';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { ValidationExceptionFilter } from './common/filters/validation-exception.filter';
import { setupViewsEngine } from './common/hbs/setup-views';
import { registerHandlebarsHelpers } from './common/hbs/helpers';
import { i18nMiddleware, userMiddleware } from './i18n/middleware';

// Load env from .env.local if present, otherwise fallback to .env
const localEnv = join(process.cwd(), '.env.local');
if (existsSync(localEnv)) {
  dotenv.config({ path: localEnv });
} else {
  dotenv.config();
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Configure Handlebars views and partials
  setupViewsEngine(app);

  // Register all custom Handlebars helpers
  registerHandlebarsHelpers();

  // Attach body parsing, cookie parsing and static asset serving
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
  app.use(i18nMiddleware);

  // Expose current user to templates
  app.use(userMiddleware);

  // Global validation (DTOs) and form error handling
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(app.get(ValidationExceptionFilter));

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
