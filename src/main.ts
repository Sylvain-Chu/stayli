import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { existsSync } from 'fs';

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

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
