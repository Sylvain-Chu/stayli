import { NestExpressApplication } from '@nestjs/platform-express';
import { existsSync } from 'fs';
import { join } from 'path';
import hbsDefault from 'hbs';

interface HbsApi {
  registerPartials: (path: string) => void;
}

const hbs = hbsDefault as unknown as HbsApi;

/**
 * Configure Handlebars views directory with fallback paths for dev and production.
 * Returns the views directory path that was selected.
 */
export function setupViewsEngine(app: NestExpressApplication): string | undefined {
  // Support multiple possible locations for Handlebars templates so the app
  // works both when running from source (mounted src/views) and when
  // running built artifacts in dist. We choose the first existing path.
  const candidates = [
    join(process.cwd(), 'src', 'views'),
    join(__dirname, '..', '..', 'views'),
    join(__dirname, '..', 'views'),
    join(__dirname, 'views'),
    join(process.cwd(), 'dist', 'src', 'views'),
  ];

  const viewsDir = candidates.find((p) => existsSync(p));

  if (!viewsDir) {
    throw new Error('Views directory not found');
  }

  // Use Express API directly instead of NestJS wrapper
  const httpAdapter = app.getHttpAdapter();
  const expressApp = httpAdapter.getInstance();

  // Set view engine first
  expressApp.set('view engine', 'hbs');

  // Then set views directory as a single string (not array)
  expressApp.set('views', viewsDir);

  // Disable layout globally (we use partials instead)
  expressApp.locals._layoutsDir = undefined;

  // Register partials for shared layout components (header/sidebar/footer)
  if (viewsDir && existsSync(join(viewsDir, 'partials'))) {
    hbs.registerPartials(join(viewsDir, 'partials'));
  }

  return viewsDir;
}
