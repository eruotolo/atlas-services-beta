'use server';

import { cache } from 'react';

import { apiClient } from '@/lib/api/apiClient';
import type { BackendPaginatedResponse, BackendSponsorDto } from '@/lib/api/backendTypes';

function mapSponsorPublico(s: BackendSponsorDto) {
    return {
        id: s.id,
        nombre: s.name,
        imagenUrl: s.imageUrl,
        linkExterno: s.externalLink,
        descripcion: s.description ?? null,
    };
}

function mapSponsorFull(s: BackendSponsorDto) {
    return {
        id: s.id,
        nombre: s.name,
        imagenUrl: s.imageUrl,
        linkExterno: s.externalLink,
        descripcion: s.description ?? null,
        nivel: s.level,
        activo: s.active,
        fechaInicio: new Date(s.startDate),
        fechaFin: new Date(s.endDate),
    };
}

export const getTodasSponsors = cache(async (page = 1, limit = 10, search?: string) => {
    try {
        let path = `/sponsors?page=${page}&limit=${limit}`;
        if (search) path += `&query=${encodeURIComponent(search)}`;

        const response = await apiClient.get<BackendPaginatedResponse<BackendSponsorDto>>(path, {
            revalidate: 0,
        });

        return {
            data: response.data.map(mapSponsorFull),
            meta: {
                total: response.meta.total,
                page: response.meta.page,
                limit: response.meta.limit,
                totalPages: response.meta.totalPages,
            },
        };
    } catch (error) {
        console.error('Error obteniendo sponsors:', error);
        return {
            data: [],
            meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
        };
    }
});

export const getSponsorsSenior = cache(async () => {
    try {
        const response = await apiClient.get<BackendPaginatedResponse<BackendSponsorDto>>(
            '/sponsors?level=SENIOR&active=true&limit=3',
            { revalidate: 120, tags: ['sponsors-senior'] },
        );
        return (response.data ?? []).map(mapSponsorPublico);
    } catch (error) {
        console.error('Error al obtener sponsors senior:', error);
        return [];
    }
});

export const getSponsorsPremium = cache(async () => {
    try {
        const response = await apiClient.get<BackendPaginatedResponse<BackendSponsorDto>>(
            '/sponsors?level=PREMIUM&active=true&limit=6',
            { revalidate: 120, tags: ['sponsors-premium'] },
        );
        return (response.data ?? []).map(mapSponsorPublico);
    } catch (error) {
        console.error('Error al obtener sponsors premium:', error);
        return [];
    }
});

export const getSponsorStandardRandom = cache(async (_categoria?: string) => {
    try {
        const response = await apiClient.get<BackendPaginatedResponse<BackendSponsorDto>>(
            '/sponsors?level=STANDARD&active=true&limit=20',
            { revalidate: 60, tags: ['sponsors-standard'] },
        );
        const sponsors = response.data ?? [];
        if (sponsors.length === 0) return null;
        return mapSponsorPublico(sponsors[Math.floor(Math.random() * sponsors.length)]);
    } catch (error) {
        console.error('Error al obtener sponsor standard:', error);
        return null;
    }
});
