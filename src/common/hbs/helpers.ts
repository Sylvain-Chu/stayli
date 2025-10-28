import hbsDefault from 'hbs';
import { format, isToday as isTodayFn, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { loadTranslationsFromFs } from '../../i18n/translation-loader';
import { math } from '../hbs-helpers/math.helper';
import { paginationPages } from '../hbs-helpers/paginationPages.helper';
import { queryString } from '../hbs-helpers/queryString.helper';
import { lt } from '../hbs-helpers/lt.helper';

const hbs = hbsDefault as { registerHelper: (name: string, fn: (...args: any[]) => any) => void };

// --- Pure helper functions ---
const eur = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });

function dateHelper(value?: Date | string) {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function formatDateHelper(
  this: { lang?: string },
  value?: Date | string,
  patternOrLang?: string,
  maybeLang?: string,
) {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  let pattern = 'EEEE d MMMM yyyy';
  let lang = this.lang;
  // Si patternOrLang est 'fr' ou 'en', c'est la langue, sinon c'est le pattern
  if (patternOrLang === 'fr' || patternOrLang === 'en') {
    lang = patternOrLang;
  } else if (patternOrLang) {
    pattern = patternOrLang;
  }
  if (maybeLang === 'fr' || maybeLang === 'en') {
    lang = maybeLang;
  }
  try {
    const locale = lang === 'fr' ? fr : undefined;
    return format(d, pattern, { locale });
  } catch {
    return '';
  }
}

function fromNowHelper(this: { lang?: string }, value?: Date | string) {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  try {
    const locale = this.lang === 'fr' ? fr : undefined;
    return formatDistanceToNow(d, { addSuffix: true, locale });
  } catch {
    return '';
  }
}

function isTodayHelper(value?: Date | string) {
  if (!value) return false;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return false;
  return isTodayFn(d);
}

function currencyHelper(value?: number) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '';
  return eur.format(value);
}

function eqHelper(a: unknown, b: unknown) {
  return a === b;
}

function yearHelper() {
  return new Date().getFullYear();
}

function timesHelper(n: unknown, block: { fn: (i: number) => string }) {
  const count = typeof n === 'number' ? n : Number(n);
  let out = '';
  for (let i = 0; i < (Number.isFinite(count) ? count : 0); i++) {
    out += block.fn(i);
  }
  return out;
}

function orHelper(a: unknown, b: unknown) {
  return a ?? b;
}

function isOptions(x: unknown): x is { data?: { root?: Record<string, unknown> } } {
  return (
    typeof x === 'object' &&
    x !== null &&
    'data' in x &&
    typeof (x as Record<string, unknown>).data === 'object'
  );
}

function tHelper(this: unknown, key: string, ...rest: unknown[]) {
  const maybeOptions = rest.length ? rest[rest.length - 1] : undefined;
  let root: Record<string, unknown> | undefined;
  if (isOptions(maybeOptions)) root = maybeOptions.data?.root;
  if (!root && typeof this === 'object' && this !== null) {
    const t = this as Record<string, unknown>;
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
    typeof this === 'object' && this !== null && 'translations' in (this as Record<string, unknown>)
      ? ((this as Record<string, unknown>).translations as Record<string, unknown>)
      : undefined;
  let translationsAny = rootTranslations || selfTranslations;
  if (!translationsAny || Object.keys(translationsAny).length === 0) {
    const lang = root && 'currentLang' in root ? String(root.currentLang) : 'en';
    translationsAny = loadTranslationsFromFs(lang);
  }
  const val = translationsAny ? translationsAny[key] : undefined;
  return typeof val === 'string' && val !== '' ? val : key;
}

function substrHelper(str?: string, start?: number, end?: number) {
  if (!str || typeof str !== 'string') return '';
  if (typeof start !== 'number') return str;
  if (typeof end !== 'number') return str.substring(start);
  return str.substring(start, end);
}

function indexOfHelper(str?: string, searchString?: string) {
  if (!str || typeof str !== 'string') return -1;
  if (!searchString || typeof searchString !== 'string') return -1;
  return str.indexOf(searchString);
}

function formatDateShortHelper(date?: Date | string) {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  };
  return d.toLocaleDateString('fr-FR', options);
}

function concatHelper(...args: any[]) {
  const strings = args.slice(0, -1);
  return strings.join('');
}

function initialsHelper(name?: string, email?: string) {
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
}

function capitalizeHelper(str?: string) {
  if (!str || typeof str !== 'string') return '';
  const s = str.trim();
  if (s.length === 0) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function addHelper(a: unknown, b: unknown) {
  const numA = typeof a === 'number' ? a : Number(a);
  const numB = typeof b === 'number' ? b : Number(b);
  if (!Number.isFinite(numA) || !Number.isFinite(numB)) return 0;
  return numA + numB;
}

function subHelper(a: unknown, b: unknown) {
  const numA = typeof a === 'number' ? a : Number(a);
  const numB = typeof b === 'number' ? b : Number(b);
  if (!Number.isFinite(numA) || !Number.isFinite(numB)) return 0;
  return numA - numB;
}

function gtHelper(a: unknown, b: unknown) {
  const numA = typeof a === 'number' ? a : Number(a);
  const numB = typeof b === 'number' ? b : Number(b);
  if (!Number.isFinite(numA) || !Number.isFinite(numB)) return false;
  return numA > numB;
}

function includesHelper(array: unknown, value: unknown) {
  if (!Array.isArray(array)) return false;
  return array.includes(value);
}

// --- Centralized helpers object ---
const helpers: Record<string, (...args: any[]) => any> = {
  date: dateHelper,
  formatDate: formatDateHelper,
  fromNow: fromNowHelper,
  isToday: isTodayHelper,
  currency: currencyHelper,
  eq: eqHelper,
  year: yearHelper,
  times: timesHelper,
  or: orHelper,
  t: tHelper,
  substr: substrHelper,
  indexOf: indexOfHelper,
  formatDateShort: formatDateShortHelper,
  concat: concatHelper,
  initials: initialsHelper,
  capitalize: capitalizeHelper,
  add: addHelper,
  sub: subHelper,
  gt: gtHelper,
  lt: lt,
  includes: includesHelper,
  math: math,
  paginationPages: paginationPages,
  queryString: queryString,
};

export function registerHandlebarsHelpers(): void {
  Object.entries(helpers).forEach(([name, fn]) => {
    hbs.registerHelper(name, fn);
  });
}
