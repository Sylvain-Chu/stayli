import hbsDefault from 'hbs';
import { format, isToday as isTodayFn, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { loadTranslationsFromFs } from '../../i18n/translation-loader';

interface HbsApi {
  registerHelper: (name: string, fn: (...args: unknown[]) => unknown) => void;
}

const hbs = hbsDefault as unknown as HbsApi;

/**
 * Register all custom Handlebars helpers for the application.
 * Includes date formatting, currency, i18n translation, and utility helpers.
 */
export function registerHandlebarsHelpers(): void {
  // Date helper: formats date as YYYY-MM-DD for input[type=date]
  hbs.registerHelper('date', function (value?: Date | string) {
    if (!value) return '';
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  // Pretty localized date: "vendredi 10 octobre 2025" / "Friday October 10, 2025"
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

  // Relative time: "dans 3 jours" / "in 3 days"
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

  // Check if a date is today
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

  // i18n translation helper
  // Be defensive about Handlebars runtime shapes: helpers can be called with
  // different arguments and the root context may be available as
  // options.data.root, this.data.root, or this._root depending on the runtime.
  function isOptions(x: unknown): x is { data?: { root?: Record<string, unknown> } } {
    return (
      typeof x === 'object' &&
      x !== null &&
      'data' in x &&
      typeof (x as Record<string, unknown>).data === 'object'
    );
  }

  hbs.registerHelper('t', function (this: unknown, key: string, ...rest: unknown[]) {
    const maybeOptions = rest.length ? rest[rest.length - 1] : undefined;

    let root: Record<string, unknown> | undefined;
    if (isOptions(maybeOptions)) root = maybeOptions.data?.root;

    if (!root && typeof this === 'object' && this !== null) {
      const t = this as Record<string, unknown>;
      // Try to find root context in various Handlebars runtime shapes
      if ('data' in t && typeof t.data === 'object' && t.data !== null) {
        const data = t.data as Record<string, unknown>;
        if ('root' in data && typeof data.root === 'object' && data.root !== null) {
          root = data.root as Record<string, unknown>;
        }
      } else if ('_root' in t && typeof t._root === 'object' && t._root !== null) {
        root = t._root as Record<string, unknown>;
      }
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

  // Substring helper: {{substr str 0 2}}
  hbs.registerHelper('substr', function (str?: string, start?: number, end?: number) {
    if (!str || typeof str !== 'string') return '';
    if (typeof start !== 'number') return str;
    if (typeof end !== 'number') return str.substring(start);
    return str.substring(start, end);
  });

  // IndexOf helper: {{indexOf str '@'}}
  hbs.registerHelper('indexOf', function (str?: string, searchString?: string) {
    if (!str || typeof str !== 'string') return -1;
    if (!searchString || typeof searchString !== 'string') return -1;
    return str.indexOf(searchString);
  });

  // Format date helper: {{formatDate date}}
  hbs.registerHelper('formatDate', function (date?: Date | string) {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '';

    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    };

    return d.toLocaleDateString('fr-FR', options);
  });

  // Concat helper: {{concat 'str1' 'str2'}}
  hbs.registerHelper('concat', function (...args: any[]) {
    // Remove the last argument which is the Handlebars options object
    const strings = args.slice(0, -1);
    return strings.join('');
  });

  // Initials helper: {{initials user.name user.email}} -> "JS" or "JD"
  hbs.registerHelper('initials', function (name?: string, email?: string) {
    try {
      let out = '';
      if (name && typeof name === 'string' && name.trim().length > 0) {
        const parts = name.trim().split(/\s+/);
        if (parts.length === 1) {
          out = parts[0].slice(0, 2);
        } else {
          out = (parts[0][0] || '') + (parts[1][0] || '');
        }
      } else if (email && typeof email === 'string' && email.indexOf('@') !== -1) {
        const local = email.split('@')[0];
        out = local.slice(0, 2);
      } else if (email && typeof email === 'string') {
        out = email.slice(0, 2);
      }
      return String(out).toUpperCase();
    } catch {
      return '';
    }
  });

  // Capitalize helper: {{capitalize 'john'}} -> 'John'
  hbs.registerHelper('capitalize', function (str?: string) {
    if (!str || typeof str !== 'string') return '';
    const s = str.trim();
    if (s.length === 0) return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  });

  // Math helpers for pagination
  hbs.registerHelper('add', function (a: unknown, b: unknown) {
    const numA = typeof a === 'number' ? a : Number(a);
    const numB = typeof b === 'number' ? b : Number(b);
    if (!Number.isFinite(numA) || !Number.isFinite(numB)) return 0;
    return numA + numB;
  });

  hbs.registerHelper('sub', function (a: unknown, b: unknown) {
    const numA = typeof a === 'number' ? a : Number(a);
    const numB = typeof b === 'number' ? b : Number(b);
    if (!Number.isFinite(numA) || !Number.isFinite(numB)) return 0;
    return numA - numB;
  });

  hbs.registerHelper('gt', function (a: unknown, b: unknown) {
    const numA = typeof a === 'number' ? a : Number(a);
    const numB = typeof b === 'number' ? b : Number(b);
    if (!Number.isFinite(numA) || !Number.isFinite(numB)) return false;
    return numA > numB;
  });

  hbs.registerHelper('includes', function (array: unknown, value: unknown) {
    if (!Array.isArray(array)) return false;
    return array.includes(value);
  });
}
