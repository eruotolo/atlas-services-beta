'use server';

import { cache } from 'react';

import { apiClient } from '@/lib/api/apiClient';
import { getAuthToken } from '@/shared/lib/auth/getAuthToken';

interface MetricasResponse {
    totalGlobal: number;
    porTipo: Record<string, number>;
    topServicios: Array<{ serviceId: string; title: string; count: number }>;
}

interface InteraccionItem {
    id: string;
    type: string;
    serviceId: string;
    userId: string | null;
    createdAt: string;
    service: { title: string };
}

interface InteraccionesResponse {
    data: InteraccionItem[];
    meta: { total: number; page: number; limit: number; totalPages: number };
}

export const getInteraccionesMetricas = cache(async (countryCode?: string) => {
    try {
        const token = await getAuthToken();
        const qs = countryCode ? `?countryCode=${encodeURIComponent(countryCode)}` : '';
        const result = await apiClient.get<MetricasResponse>(`/interactions/metrics${qs}`, {
            token,
            revalidate: 0,
        });
        return {
            totalGlobal: result.totalGlobal,
            porTipo: result.porTipo,
            topServicios: result.topServicios.map((s) => ({
                servicioId: s.serviceId,
                titulo: s.title,
                total: s.count,
                proveedor: '',
            })),
        };
    } catch (error) {
        console.error('Error obteniendo métricas de interacciones:', error);
        return {
            totalGlobal: 0,
            porTipo: {} as Record<string, number>,
            topServicios: [] as Array<{
                servicioId: string;
                titulo: string;
                total: number;
                proveedor: string;
            }>,
        };
    }
});

export const getInteracciones = cache(
    async (page = 1, limit = 10, search?: string, countryCode?: string) => {
    try {
        const token = await getAuthToken();
        const qs = new URLSearchParams({
            page: String(page),
            limit: String(limit),
            ...(search ? { query: search } : {}),
            ...(countryCode ? { countryCode } : {}),
        });

        const result = await apiClient.get<InteraccionesResponse>(`/interactions?${qs}`, {
            token,
            revalidate: 0,
        });

        return {
            data: result.data.map((item) => ({
                id: item.id,
                tipo: item.type,
                createdAt: new Date(item.createdAt),
                servicio: {
                    titulo: item.service.title,
                    usuario: { nombre: '' },
                },
                usuario: null,
            })),
            meta: result.meta,
        };
    } catch (error) {
        console.error('Error obteniendo interacciones:', error);
        return {
            data: [],
            meta: { total: 0, page, limit, totalPages: 0 },
        };
    }
    },
);

// ─── Estadísticas per-service (dueño del servicio o admin) ────────────────────

export interface ServiceStatItem {
    type: string;
    total: number;
}

export const getServiceStats = cache(async (serviceId: string): Promise<ServiceStatItem[]> => {
    try {
        const token = await getAuthToken();
        const result = await apiClient.get<ServiceStatItem[]>(
            `/services/${serviceId}/stats`,
            { token, revalidate: 0 },
        );
        return result;
    } catch (error) {
        console.error(`Error obteniendo stats del servicio ${serviceId}:`, error);
        return [];
    }
});

// DEPRECATED
export const getInteraccionesReport = cache(async () => {
    return {
        ultimasInteracciones: [],
        metricas: {
            totalGlobal: 0,
            porTipo: {},
            topServicios: [],
        },
    };
});
