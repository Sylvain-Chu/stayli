import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

/**
 * In-memory cache for translations to avoid re-reading files on every request.
 */
const translationsCache: Record<string, Record<string, string>> = {};

/**
 * Flatten a nested translation object into dot-notation keys.
 * Example: { common: { save: "Save" } } => { "common.save": "Save" }
 */
export function flattenTranslations(
  obj: Record<string, unknown>,
  prefix = '',
): Record<string, string> {
  const result: Record<string, string> = {};

  const walk = (o: Record<string, unknown>, p: string) => {
    for (const k of Object.keys(o)) {
      const v = o[k];
      const nk = p ? `${p}.${k}` : k;
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        walk(v as Record<string, unknown>, nk);
      } else if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
        result[nk] = String(v);
      }
    }
  };

  walk(obj, prefix);
  return result;
}

/**
 * Find the i18n directory across multiple candidate paths (dev/prod).
 */
export function findI18nBasePath(): string | undefined {
  const candidates = [
    join(__dirname, 'i18n'),
    join(__dirname, '..', 'i18n'),
    join(process.cwd(), 'src', 'i18n'),
    join(process.cwd(), 'dist', 'src', 'i18n'),
  ];
  return candidates.find((p) => existsSync(p));
}

/**
 * Load translations from filesystem with caching.
 * Returns a flat map of translation keys (e.g., "common.save" => "Save").
 */
export function loadTranslationsFromFs(lang: string): Record<string, string> {
  if (translationsCache[lang]) {
    return translationsCache[lang];
  }

  const base = findI18nBasePath();
  if (!base) return {};

  try {
    const filePath = join(base, lang, 'translation.json');
    if (!existsSync(filePath)) return {};

    const raw = readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const flat = flattenTranslations(parsed);

    translationsCache[lang] = flat;
    return flat;
  } catch {
    return {};
  }
}

/**
 * Clear the translation cache (useful for testing or hot-reload scenarios).
 */
export function clearTranslationCache(): void {
  for (const key of Object.keys(translationsCache)) {
    delete translationsCache[key];
  }
}
