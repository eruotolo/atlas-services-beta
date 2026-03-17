'use server';

import { cache } from 'react';

import { apiClient } from '@/lib/api/apiClient';
import { getAuthToken } from '@/shared/lib/auth/getAuthToken';

import type { PrecioPremium, SuscripcionWithDetails } from '../types/paymentTypes';

interface BackendPrecioDto {
    id: string;
    durationMonths: number;
    price: number;
    description: string | null;
    active: boolean;
}

function mapPrecioDto(p: BackendPrecioDto): PrecioPremium {
    return {
        id: p.id,
        descripcion: p.description ?? '',
        precio: Number(p.price),
        duracionMeses: p.durationMonths,
        activo: p.active,
    };
}

export const getHistorialPagos = cache(
    async (page = 1, limit = 10, _startDate?: string, _endDate?: string) => {
        return {
            data: [] as SuscripcionWithDetails[],
            meta: { page, limit, total: 0, totalPages: 0 },
            stats: {
                ingresosBrutos: 0,
                pendientes: 0,
                completados: 0,
                total: 0,
                montoPendiente: 0,
            },
        };
    },
);

export const getSuscripcionActiva = cache(async () => {
    return null;
});

export const getPagoReciente = cache(async () => {
    return null;
});

export const obtenerPreciosPremiumActivos = cache(async (): Promise<PrecioPremium[]> => {
    try {
        const result = await apiClient.get<BackendPrecioDto[]>('/prices', {
            revalidate: 300,
            tags: ['precios-premium'],
        });
        return (result ?? []).map(mapPrecioDto);
    } catch (error) {
        console.error('Error obteniendo precios premium:', error);
        return [];
    }
});

export const getAdminPreciosPremium = cache(
    async (page = 1, limit = 10, _search?: string) => {
        try {
            const token = await getAuthToken();
            const result = await apiClient.get<BackendPrecioDto[]>('/prices', {
                token,
                revalidate: 0,
            });
            const data = (result ?? []).map(mapPrecioDto);
            return {
                data,
                meta: { total: data.length, page, limit, totalPages: Math.ceil(data.length / limit) },
            };
        } catch (error) {
            console.error('Error obteniendo precios premium (admin):', error);
            return {
                data: [] as PrecioPremium[],
                meta: { total: 0, page, limit, totalPages: 0 },
            };
        }
    },
);
