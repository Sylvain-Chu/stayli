import { Request, Response, NextFunction } from 'express';
import { flattenTranslations, findI18nBasePath } from './translation-loader';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

/**
 * Express middleware to inject i18n translations into res.locals.
 * Detects language from cookie or query param, loads the appropriate
 * translation file, and flattens it into res.locals.translations.
 */
export function i18nMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Get language from cookie, query param, or default to 'en'
  const cookieLang = typeof req.cookies?.lang === 'string' ? req.cookies.lang : undefined;
  const queryLang = typeof req.query.lang === 'string' ? req.query.lang : undefined;
  const lang = cookieLang || queryLang || 'en';

  const validLangs = ['en', 'fr'];
  const selectedLang = validLangs.includes(lang) ? lang : 'en';

  // Load translations dynamically from a computed i18n path (support src and dist)
  const i18nBase = findI18nBasePath();

  if (!i18nBase) {
    (res.locals as Record<string, unknown>).translations = {};
    (res.locals as Record<string, unknown>).lang = 'en';
    (res.locals as Record<string, unknown>).currentLang = 'en';
    return next();
  }

  try {
    const filePath = join(i18nBase, selectedLang, 'translation.json');
    if (!existsSync(filePath)) throw new Error('missing translation file');

    const raw = readFileSync(filePath, 'utf8');
    const translations = JSON.parse(raw) as Record<string, unknown>;
    const flatTranslations = flattenTranslations(translations);

    (res.locals as Record<string, unknown>).translations = flatTranslations;
    (res.locals as Record<string, unknown>).lang = selectedLang;
    (res.locals as Record<string, unknown>).currentLang = selectedLang;
  } catch {
    (res.locals as Record<string, unknown>).translations = {};
    (res.locals as Record<string, unknown>).lang = 'en';
    (res.locals as Record<string, unknown>).currentLang = 'en';
  }

  next();
}

/**
 * Middleware to expose the current authenticated user to Handlebars templates.
 */
export function userMiddleware(req: Request, res: Response, next: NextFunction): void {
  (res.locals as Record<string, unknown>).user = (req as unknown as { user?: unknown }).user;
  next();
}
