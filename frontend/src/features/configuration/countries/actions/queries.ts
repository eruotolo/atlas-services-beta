'use server';

import { apiClient } from '@/lib/api/apiClient';
import { getAuthToken } from '@/shared/lib/auth/getAuthToken';

import type { Country } from '@/features/geo/types/geoTypes';

export async function getAdminCountries(): Promise<Country[]> {
    const token = await getAuthToken();
    try {
        return await apiClient.get<Country[]>('/geo/admin/countries', { token });
    } catch {
        return [];
    }
}
