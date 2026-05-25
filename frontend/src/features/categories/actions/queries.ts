'use server';

import { cache } from 'react';

import { apiClient } from '@/lib/api/apiClient';
import type { BackendCategoryDto } from '@/lib/api/backendTypes';
import { getAuthToken } from '@/shared/lib/auth/getAuthToken';

function mapCategoryDto(c: BackendCategoryDto) {
    return {
        id: c.id,
        nombre: c.name,
        slug: c.slug,
        icono: c.icon ?? null,
        orden: c.order,
        activo: c.active,
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
        return (Array.isArray(response) ? response : []).map(mapCategoryDto);
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
});

export const getAdminCategorias = cache(async (page = 1, limit = 12, search?: string) => {
    try {
        const token = await getAuthToken();
        const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (search) qs.set('query', search);

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
            data: items.map(mapCategoryDto),
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
        return (Array.isArray(response) ? response.slice(0, 4) : []).map(mapCategoryDto);
    } catch (error) {
        console.error('Error fetching top categories:', error);
        return [];
    }
});
