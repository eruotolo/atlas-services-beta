import { apiClient } from '@/shared/lib/apiClient';

export interface GeoCountry {
    readonly id: string;
    readonly code: string;
    readonly name: string;
}

export interface GeoRegion {
    readonly id: string;
    readonly name: string;
    readonly code: string;
}

export interface GeoLocality {
    readonly id: string;
    readonly name: string;
    readonly slug: string;
}

export async function getCountry(countryCode: string): Promise<GeoCountry> {
    return apiClient.get<GeoCountry>(`/geo/countries/${countryCode}`);
}

export async function getRegions(countryCode: string): Promise<readonly GeoRegion[]> {
    return apiClient.get<readonly GeoRegion[]>(`/geo/countries/${countryCode}/regions`);
}

export async function getLocalities(regionId: string): Promise<readonly GeoLocality[]> {
    return apiClient.get<readonly GeoLocality[]>(`/geo/regions/${regionId}/localities`);
}
