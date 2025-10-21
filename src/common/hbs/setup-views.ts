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
    // Fallback to previous behavior; this will cause a clear error if none found
    app.setBaseViewsDir(join(__dirname, '..', '..', 'views'));
  } else {
    app.setBaseViewsDir(viewsDir);
  }

  app.setViewEngine('hbs');

  // Register partials for shared layout components (header/sidebar/footer)
  if (viewsDir && existsSync(join(viewsDir, 'partials'))) {
    hbs.registerPartials(join(viewsDir, 'partials'));
  }

  return viewsDir;
}
