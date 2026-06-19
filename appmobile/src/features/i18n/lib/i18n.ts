import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const es = require('../translations/es.json') as Record<string, unknown>;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const en = require('../translations/en.json') as Record<string, unknown>;

const i18nInstance = new I18n({ es, en });
i18nInstance.enableFallback = true;
i18nInstance.defaultLocale = 'es';

// LATAM-first strategy: default to Spanish unless there is a positive Spanish signal
// (Spanish region or Spanish language). Without GPS/IP geolocation we cannot distinguish
// a Chilean user with an English-language phone from a real US user — so we never
// auto-default to English. US/English users can switch via the country+language chip.
const SPANISH_REGIONS = new Set([
  'CL', 'AR', 'UY', 'ES', 'MX', 'CO', 'PE', 'VE', 'EC', 'BO',
  'PY', 'CR', 'DO', 'GT', 'HN', 'NI', 'PA', 'PR', 'SV', 'CU',
]);

function resolveInitialLocale(): 'es' | 'en' {
  const locales = Localization.getLocales();

  // Any locale signals Spanish → use Spanish
  const hasSpanishSignal = locales.some(
    (l) =>
      SPANISH_REGIONS.has(l.regionCode?.toUpperCase() ?? '') ||
      l.languageCode === 'es',
  );
  if (hasSpanishSignal) return 'es';

  // No Spanish signal at all → still default to Spanish (LATAM-first).
  // English users switch via the chip.
  return 'es';
}

i18nInstance.locale = resolveInitialLocale();

/**
 * Translate a scope using an explicit locale value passed as a React state
 * dependency. This avoids the React Compiler caching bug that occurs when
 * reading the mutable singleton locale inside a callback — by closing over
 * `locale` directly, the compiler knows to invalidate the result when it
 * changes.
 */
export function translate(
  locale: 'es' | 'en',
  scope: string,
  options?: Record<string, unknown>,
): string {
  const result = i18nInstance.t(scope, { locale, ...options });
  return typeof result === 'string' ? result : scope;
}

export function setLocale(locale: 'es' | 'en'): void {
  i18nInstance.locale = locale;
}

export function getLocale(): 'es' | 'en' {
  return i18nInstance.locale === 'en' ? 'en' : 'es';
}
