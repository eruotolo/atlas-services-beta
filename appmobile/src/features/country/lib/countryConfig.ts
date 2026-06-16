export type CountryCode = 'cl' | 'ar' | 'uy' | 'es' | 'us';
export type Gateway = 'MERCADOPAGO' | 'STRIPE';

export interface CountryConfig {
  readonly code: CountryCode;
  readonly name: string;
  readonly currency: string;
  readonly currencySymbol: string;
  readonly locale: string;
  readonly flag: string;
  readonly regionLabel: string;
  readonly localityLabel: string;
  readonly timezone: string;
  readonly gateway: Gateway;
}

export const COUNTRY_CONFIG: Record<CountryCode, CountryConfig> = {
  cl: {
    code: 'cl',
    name: 'Chile',
    currency: 'CLP',
    currencySymbol: '$',
    locale: 'es-CL',
    flag: '🇨🇱',
    regionLabel: 'Región',
    localityLabel: 'Comuna',
    timezone: 'America/Santiago',
    gateway: 'MERCADOPAGO',
  },
  ar: {
    code: 'ar',
    name: 'Argentina',
    currency: 'ARS',
    currencySymbol: '$',
    locale: 'es-AR',
    flag: '🇦🇷',
    regionLabel: 'Provincia',
    localityLabel: 'Localidad',
    timezone: 'America/Argentina/Buenos_Aires',
    gateway: 'MERCADOPAGO',
  },
  uy: {
    code: 'uy',
    name: 'Uruguay',
    currency: 'UYU',
    currencySymbol: '$',
    locale: 'es-UY',
    flag: '🇺🇾',
    regionLabel: 'Departamento',
    localityLabel: 'Localidad',
    timezone: 'America/Montevideo',
    gateway: 'MERCADOPAGO',
  },
  es: {
    code: 'es',
    name: 'España',
    currency: 'EUR',
    currencySymbol: '€',
    locale: 'es-ES',
    flag: '🇪🇸',
    regionLabel: 'Comunidad Autónoma',
    localityLabel: 'Municipio',
    timezone: 'Europe/Madrid',
    gateway: 'STRIPE',
  },
  us: {
    code: 'us',
    name: 'United States',
    currency: 'USD',
    currencySymbol: '$',
    locale: 'en-US',
    flag: '🇺🇸',
    regionLabel: 'State',
    localityLabel: 'City',
    timezone: 'America/New_York',
    gateway: 'STRIPE',
  },
} as const;

export const COUNTRY_CODES: readonly CountryCode[] = ['cl', 'ar', 'uy', 'es', 'us'];

const REGION_TO_COUNTRY: Readonly<Record<string, CountryCode>> = {
  CL: 'cl',
  AR: 'ar',
  UY: 'uy',
  ES: 'es',
  US: 'us',
};

export function detectCountryFromRegion(regionCode: string | null | undefined): CountryCode {
  if (regionCode == null) return 'cl';
  return REGION_TO_COUNTRY[regionCode.toUpperCase()] ?? 'cl';
}

export function formatPrice(amount: number, countryCode: CountryCode): string {
  const config = COUNTRY_CONFIG[countryCode];
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.currency,
    minimumFractionDigits: countryCode === 'cl' ? 0 : 2,
    maximumFractionDigits: countryCode === 'cl' ? 0 : 2,
  }).format(amount);
}
