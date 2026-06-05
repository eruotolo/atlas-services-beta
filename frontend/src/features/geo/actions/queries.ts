'use server';

import { apiClient } from '@/lib/api/apiClient';
import type { CountryConfig } from '@/lib/providers/CountryProvider';

import type { GeoLocality, GeoRegion } from '../types/geoTypes';

const FALLBACK_CONFIGS: Record<string, CountryConfig> = {
    cl: {
        code: 'cl',
        name: 'Chile',
        currency: 'CLP',
        locale: 'es-CL',
        timezone: 'America/Santiago',
        gateway: 'MERCADOPAGO',
        regionLabel: 'Región',
        localityLabel: 'Comuna',
    },
    ar: {
        code: 'ar',
        name: 'Argentina',
        currency: 'ARS',
        locale: 'es-AR',
        timezone: 'America/Argentina/Buenos_Aires',
        gateway: 'MERCADOPAGO',
        regionLabel: 'Provincia',
        localityLabel: 'Localidad',
    },
    uy: {
        code: 'uy',
        name: 'Uruguay',
        currency: 'UYU',
        locale: 'es-UY',
        timezone: 'America/Montevideo',
        gateway: 'MERCADOPAGO',
        regionLabel: 'Departamento',
        localityLabel: 'Localidad',
    },
    es: {
        code: 'es',
        name: 'España',
        currency: 'EUR',
        locale: 'es-ES',
        timezone: 'Europe/Madrid',
        gateway: 'STRIPE',
        regionLabel: 'Comunidad Autónoma',
        localityLabel: 'Municipio',
    },
    us: {
        code: 'us',
        name: 'United States',
        currency: 'USD',
        locale: 'en-US',
        timezone: 'America/New_York',
        gateway: 'STRIPE',
        regionLabel: 'State',
        localityLabel: 'City',
    },
};

export async function getCountryConfig(countryCode: string): Promise<CountryConfig | null> {
    try {
        return await apiClient.get<CountryConfig>(`/geo/countries/${countryCode}`, {
            revalidate: 86400,
            tags: [`country-${countryCode}`],
        });
    } catch {
        return FALLBACK_CONFIGS[countryCode] ?? null;
    }
}

export async function getRegionsByCountry(countryCode: string): Promise<GeoRegion[]> {
    try {
        return await apiClient.get<GeoRegion[]>(`/geo/countries/${countryCode}/regions`, {
            revalidate: 86400,
            tags: [`regions-${countryCode}`],
        });
    } catch {
        return [];
    }
}

export async function getLocalitiesByRegion(regionId: string): Promise<GeoLocality[]> {
    try {
        return await apiClient.get<GeoLocality[]>(`/geo/regions/${regionId}/localities`, {
            revalidate: 86400,
            tags: [`localities-${regionId}`],
        });
    } catch {
        return [];
    }
}

export async function searchLocalitiesByCountry(countryCode: string): Promise<Array<{ id: string, name: string, slug: string, region?: { name: string } }>> {
    try {
        return await apiClient.get<any[]>(`/geo/countries/${countryCode}/localities/search`, {
            revalidate: 86400,
            tags: [`localities-${countryCode}`],
        });
    } catch {
        return [];
    }
}
