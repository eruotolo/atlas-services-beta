export interface CountryUiConfig {
    currency: string;
    locale: string;
    currencySymbol: string;
    localityLabel: string;
    regionLabel: string;
    timezone: string;
}

export interface CountrySEOConfig {
    siteName: string;
    description: string;
    url: string;
    geoRegion: string;
    locale: string;
    ogLocale: string;
    countryName: string;
}

export const COUNTRY_CONFIG: Record<string, CountryUiConfig> = {
    cl: {
        currency: 'CLP',
        locale: 'es-CL',
        currencySymbol: '$',
        localityLabel: 'Comuna',
        regionLabel: 'Región',
        timezone: 'America/Santiago',
    },
    ar: {
        currency: 'ARS',
        locale: 'es-AR',
        currencySymbol: '$',
        localityLabel: 'Localidad',
        regionLabel: 'Provincia',
        timezone: 'America/Argentina/Buenos_Aires',
    },
    uy: {
        currency: 'UYU',
        locale: 'es-UY',
        currencySymbol: '$',
        localityLabel: 'Localidad',
        regionLabel: 'Departamento',
        timezone: 'America/Montevideo',
    },
    es: {
        currency: 'EUR',
        locale: 'es-ES',
        currencySymbol: '€',
        localityLabel: 'Municipio',
        regionLabel: 'Comunidad Autónoma',
        timezone: 'Europe/Madrid',
    },
    us: {
        currency: 'USD',
        locale: 'en-US',
        currencySymbol: '$',
        localityLabel: 'City',
        regionLabel: 'State',
        timezone: 'America/New_York',
    },
};

export const COUNTRY_SEO_CONFIG: Record<string, CountrySEOConfig> = {
    cl: {
        siteName: 'Hireeo Chile',
        description: 'Encuentra electricistas, carpinteros, gasfíter y más servicios en Chile',
        url: process.env.NEXT_PUBLIC_APP_URL_CL ?? 'https://hireeo.app/cl',
        geoRegion: 'CL-LL',
        locale: 'es-CL',
        ogLocale: 'es_CL',
        countryName: 'Chile',
    },
    ar: {
        siteName: 'Hireeo Argentina',
        description: 'Encuentra plomeros, electricistas, carpinteros y más servicios en Argentina',
        url: process.env.NEXT_PUBLIC_APP_URL_AR ?? 'https://hireeo.app/ar',
        geoRegion: 'AR',
        locale: 'es-AR',
        ogLocale: 'es_AR',
        countryName: 'Argentina',
    },
    uy: {
        siteName: 'Hireeo Uruguay',
        description: 'Encuentra fontaneros, electricistas, carpinteros y más servicios en Uruguay',
        url: process.env.NEXT_PUBLIC_APP_URL_UY ?? 'https://hireeo.app/uy',
        geoRegion: 'UY',
        locale: 'es-UY',
        ogLocale: 'es_UY',
        countryName: 'Uruguay',
    },
    es: {
        siteName: 'Hireeo España',
        description: 'Encuentra fontaneros, electricistas, carpinteros y más servicios en España',
        url: process.env.NEXT_PUBLIC_APP_URL_ES ?? 'https://hireeo.app/es',
        geoRegion: 'ES',
        locale: 'es-ES',
        ogLocale: 'es_ES',
        countryName: 'España',
    },
    us: {
        siteName: 'Hireeo USA',
        description:
            'Find plumbers, electricians, carpenters and more services in the United States',
        url: process.env.NEXT_PUBLIC_APP_URL_US ?? 'https://hireeo.app/us',
        geoRegion: 'US',
        locale: 'en-US',
        ogLocale: 'en_US',
        countryName: 'United States',
    },
};

export function formatPrice(amount: number, countryCode: string): string {
    const config = COUNTRY_CONFIG[countryCode] ?? COUNTRY_CONFIG.cl;
    return new Intl.NumberFormat(config.locale, {
        style: 'currency',
        currency: config.currency,
        minimumFractionDigits: countryCode === 'cl' ? 0 : 2,
        maximumFractionDigits: countryCode === 'cl' ? 0 : 2,
    }).format(amount);
}

export function formatDate(date: Date | string, countryCode: string): string {
    const config = COUNTRY_CONFIG[countryCode] ?? COUNTRY_CONFIG.cl;
    return new Intl.DateTimeFormat(config.locale, {
        timeZone: config.timezone,
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(new Date(date));
}

export function buildCountryLink(path: string, countryCode: string): string {
    return `/${countryCode}${path}`;
}

/** Función pura para Server Components. countryLink('cl', '/buscar') → '/cl/buscar' */
export function countryLink(country: string, path: string): string {
    return `/${country}${path}`;
}
