'use server';

import { cache } from 'react';

import { apiClient } from '@/lib/api/apiClient';
import type {
    BackendPaginatedResponse,
    BackendServiceDto,
    BackendServiciosQueryParams,
} from '@/lib/api/backendTypes';

import { comunaMap } from '@/shared/constants/locations';
import { Comuna } from '@/shared/types/common';

const PLACEHOLDER_IMAGE = 'https://placehold.co/600x400/3B82F6/FFFFFF?text=Sin+Imagen';

function buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
    const entries = Object.entries(params).filter(
        ([, v]) => v !== undefined && v !== '' && v !== null,
    );
    if (entries.length === 0) return '';
    return `?${entries.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join('&')}`;
}

function mapComuneValue(commune: string): Comuna {
    return comunaMap[commune] ?? comunaMap[commune.toUpperCase()] ?? Comuna.CASTRO;
}

function mapServiceDto(s: BackendServiceDto) {
    const primeraCategoria = s.categories[0];
    return {
        id: s.id,
        slug: s.slug,
        userId: s.userId,
        userName: s.userName,
        title: s.title,
        category: primeraCategoria?.name ?? 'Sin categoría',
        categoryId: primeraCategoria?.id ?? '',
        categories: s.categories.map((c) => ({ id: c.id, nombre: c.name })),
        description: s.description,
        price: Number(s.price),
        comuna: mapComuneValue(s.commune),
        rating: Number(s.averageRating ?? 0),
        reviewsCount: s.totalRatings,
        image: s.mainImage ?? s.images[0] ?? PLACEHOLDER_IMAGE,
        isPremium: s.featured && s.level === 'PREMIUM',
        updatedAt: s.updatedAt ? new Date(s.updatedAt) : undefined,
    };
}

function mapServiceDetailDto(s: BackendServiceDto) {
    const base = mapServiceDto(s);
    return {
        ...base,
        userEmail: s.userEmail ?? null,
        userPhone: s.userPhone ?? null,
        userAvatar: s.userAvatar ?? null,
        nombreContacto: s.contactName ?? null,
        emailContacto: s.contactEmail ?? null,
        telefonoContacto: s.contactPhone ?? null,
        imagenPrincipal: s.mainImage ?? null,
        imagenes: s.images,
        fechaInicio: s.startDate ? new Date(s.startDate) : null,
        fechaFin: s.endDate ? new Date(s.endDate) : null,
        redesSociales: (s.socialNetworks ?? []).map((rs) => ({ tipo: rs.tipo, url: rs.url })),
        resenas: (s.reviews ?? []).map((r) => ({
            id: r.id,
            userName: r.userName,
            rating: r.rating,
            comment: r.comment,
            date: new Date(r.date),
        })),
    };
}

export const getPublicFeaturedServices = cache(async () => {
    try {
        const params: BackendServiciosQueryParams = { limit: 8, page: 1 };
        const qs = buildQueryString(params as Record<string, string | number | boolean>);

        const response = await apiClient.get<BackendPaginatedResponse<BackendServiceDto>>(
            `/services${qs}`,
            { revalidate: 60, tags: ['servicios-destacados'] },
        );

        return (response?.data ?? []).map(mapServiceDto);
    } catch (error) {
        console.error('Error fetching featured services:', error);
        return [];
    }
});

export const getAllPublicServices = cache(async () => {
    try {
        const qs = buildQueryString({ limit: 100, page: 1 });

        const response = await apiClient.get<BackendPaginatedResponse<BackendServiceDto>>(
            `/services${qs}`,
            { revalidate: 60, tags: ['servicios'] },
        );

        return (response?.data ?? []).map(mapServiceDto);
    } catch (error) {
        console.error('Error fetching all public services:', error);
        return [];
    }
});

export const getFilteredServices = cache(
    async ({
        query = '',
        category = 'Todos',
        comuna = 'Todas',
        page = 1,
        limit = 9,
    }: {
        query?: string;
        category?: string;
        comuna?: string;
        page?: number;
        limit?: number;
    }) => {
        try {
            const params: Record<string, string | number | boolean | undefined> = { page, limit };

            if (query) params.query = query;
            if (category && category !== 'Todos') params.category = category;
            if (comuna && comuna !== 'Todas') params.commune = comuna;

            const qs = buildQueryString(params);

            const response = await apiClient.get<BackendPaginatedResponse<BackendServiceDto>>(
                `/services${qs}`,
                { revalidate: 30, tags: ['servicios'] },
            );

            return {
                services: (response?.data ?? []).map(mapServiceDto),
                totalCount: response?.meta?.total ?? 0,
                totalPages: response?.meta?.totalPages ?? 0,
                currentPage: response?.meta?.page ?? 1,
            };
        } catch (error) {
            console.error('Error fetching filtered services:', error);
            return { services: [], totalCount: 0, totalPages: 0, currentPage: 1 };
        }
    },
);

export const getServicioById = cache(async (id: string) => {
    try {
        const servicio = await apiClient.get<BackendServiceDto>(`/services/${id}`, {
            revalidate: 60,
            tags: [`servicio-${id}`],
        });

        return mapServiceDetailDto(servicio);
    } catch (error) {
        console.error('Error fetching servicio by ID:', error);
        return null;
    }
});

export const getServicioBySlug = cache(async (slug: string) => {
    try {
        const servicio = await apiClient.get<BackendServiceDto>(
            `/services/${slug}`,
            { revalidate: 60, tags: [`servicio-slug-${slug}`] },
        );

        if (!servicio) return null;

        return mapServiceDetailDto(servicio);
    } catch (error) {
        console.error('Error fetching servicio by slug:', error);
        return null;
    }
});

export const getAdminServices = cache(async (page = 1, limit = 10, search?: string) => {
    try {
        const params: Record<string, string | number | undefined> = { page, limit };
        if (search) params.query = search;

        const qs = buildQueryString(params as Record<string, string | number | boolean>);

        const response = await apiClient.get<BackendPaginatedResponse<BackendServiceDto>>(
            `/services${qs}`,
            { revalidate: 0 },
        );

        const data = response.data.map((s) => {
            const primeraCategoria = s.categories[0];
            return {
                id: s.id,
                slug: s.slug,
                usuarioId: s.userId,
                titulo: s.title,
                descripcion: s.description,
                precio: Number(s.price),
                comuna: s.commune,
                imagenPrincipal: s.mainImage,
                imagenes: s.images,
                activo: s.active,
                destacado: s.featured,
                nivel: s.level,
                fechaInicio: s.startDate ? new Date(s.startDate) : null,
                fechaFin: s.endDate ? new Date(s.endDate) : null,
                calificacionPromedio: s.averageRating ? Number(s.averageRating) : null,
                totalCalificaciones: s.totalRatings,
                createdAt: new Date(s.createdAt),
                updatedAt: new Date(s.updatedAt),
                usuario: { nombre: s.userName, email: s.userEmail ?? '' },
                categoria: {
                    nombre: primeraCategoria?.name ?? 'Sin categoría',
                },
                categoriaId: primeraCategoria?.name ?? '',
                categories: s.categories.map((c) => ({ id: c.id, nombre: c.name })),
                redesSociales: (s.socialNetworks ?? []).map((rs) => ({ tipo: rs.tipo, url: rs.url })),
            };
        });

        return {
            data,
            meta: {
                total: response.meta.total,
                page: response.meta.page,
                limit: response.meta.limit,
                totalPages: response.meta.totalPages,
            },
        };
    } catch (error) {
        console.error('Error fetching admin services:', error);
        return {
            data: [],
            meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
        };
    }
});
