'use server';

import { cache } from 'react';

import { apiClient } from '@/lib/api/apiClient';
import type { BackendCategoryDto } from '@/lib/api/backendTypes';
import { getAuthToken } from '@/shared/lib/auth/getAuthToken';

// Países cuyo public se muestra en inglés → usan nameEn si existe
const ENGLISH_COUNTRIES = new Set(['us']);

function mapCategoryDto(c: BackendCategoryDto, countryCode?: string) {
    const useEnglish = countryCode ? ENGLISH_COUNTRIES.has(countryCode.toLowerCase()) : false;
    return {
        id: c.id,
        nombre: useEnglish && c.nameEn ? c.nameEn : c.name,
        nombreEn: c.nameEn ?? null,
        slug: c.slug,
        icono: c.icon ?? null,
        orden: c.order,
        activo: c.active,
        serviceCount: c.serviceCount,
    };
}

export const getCategorias = cache(async (countryCode = 'cl') => {
    try {
        const response = await apiClient.get<BackendCategoryDto[]>(
            `/categories?countryCode=${countryCode}`,
            {
                revalidate: 300,
                tags: [`categorias-${countryCode}`],
            },
        );
        return (Array.isArray(response) ? response : []).map((c) =>
            mapCategoryDto(c, countryCode),
        );
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
});

export const getAdminCategorias = cache(async (page = 1, limit = 12, search?: string, countryCode?: string) => {
    try {
        const token = await getAuthToken();
        const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (search) qs.set('query', search);
        if (countryCode) qs.set('countryCode', countryCode);

        const response = await apiClient.get<{
            items?: BackendCategoryDto[];
            data?: BackendCategoryDto[];
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        }>(`/categories/admin?${qs}`, { revalidate: 0, token });

        const items = response.items ?? response.data ?? [];
        return {
            data: items.map((c) => mapCategoryDto(c, countryCode)),
            meta: {
                total: response.total,
                page: response.page,
                limit: response.limit,
                totalPages: response.totalPages,
            },
        };
    } catch (error) {
        console.error('Error fetching admin categories:', error);
        return { data: [], meta: { total: 0, page: 1, limit: 12, totalPages: 0 } };
    }
});

export const getTopCategories = cache(async (countryCode = 'cl') => {
    try {
        const response = await apiClient.get<BackendCategoryDto[]>(
            `/categories?countryCode=${countryCode}`,
            {
                revalidate: 120,
                tags: [`categorias-top-${countryCode}`],
            },
        );
        return (Array.isArray(response) ? response.slice(0, 4) : []).map((c) =>
            mapCategoryDto(c, countryCode),
        );
    } catch (error) {
        console.error('Error fetching top categories:', error);
        return [];
    }
});
