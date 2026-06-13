'use server';

import { cache } from 'react';

import { apiClient } from '@/lib/api/apiClient';
import { getAuthToken } from '@/shared/lib/auth/getAuthToken';
import { getAdminCountries } from '@/features/configuration/countries/actions/queries';

import type { Country } from '@/features/geo/types/geoTypes';
import type { PrecioPremium, SuscripcionWithDetails } from '../types/paymentTypes';

interface BackendPrecioDto {
    id: string;
    durationMonths: number;
    price: number;
    currency: string;
    description: string | null;
    active: boolean;
}

interface BackendPrecioDtoWithCountry extends BackendPrecioDto {
    country?: { code: string; name: string; currency: string };
    countryCode?: string;
    countryName?: string;
}

function mapPrecioDto(p: BackendPrecioDto): PrecioPremium {
    return {
        id: p.id,
        descripcion: p.description ?? '',
        precio: Number(p.price),
        duracionMeses: p.durationMonths,
        activo: p.active,
        currency: p.currency,
    };
}

function mapPrecioDtoWithCountry(
    p: BackendPrecioDtoWithCountry,
    countryCode?: string,
    countryName?: string,
): PrecioPremium {
    return {
        ...mapPrecioDto(p),
        countryCode: p.country?.code ?? countryCode ?? '',
        countryName: p.country?.name ?? countryName ?? '',
    };
}

interface BackendSubscriptionItem {
    id: string;
    durationMonths: number;
    amount: string | number;
    currency: string;
    paymentGateway: string;
    paymentMethod: string | null;
    paymentStatus: string;
    transactionId: string | null;
    active: boolean;
    startDate: string;
    endDate: string;
    createdAt: string;
    service: { id: string; title: string; user: { name: string; email: string } };
}

interface BackendSubscriptionsResponse {
    data: BackendSubscriptionItem[];
    meta: { total: number; page: number; limit: number; totalPages: number };
    stats: {
        ingresosBrutos: number;
        montoPendiente: number;
        pendientes: number;
        completados: number;
        total: number;
    };
}

const ESTADO_PAGO: Record<string, string> = {
    completed: 'completado',
    pending: 'pendiente',
    failed: 'fallido',
};

function mapSuscripcion(s: BackendSubscriptionItem): SuscripcionWithDetails {
    return {
        id: s.id,
        servicioId: s.service.id,
        duracionMeses: s.durationMonths,
        monto: Number(s.amount),
        metodoPago: s.paymentMethod ?? '',
        estadoPago: ESTADO_PAGO[s.paymentStatus] ?? s.paymentStatus,
        transaccionId: s.transactionId,
        fechaInicio: new Date(s.startDate),
        fechaFin: new Date(s.endDate),
        activa: s.active,
        createdAt: new Date(s.createdAt),
        updatedAt: new Date(s.createdAt),
        servicio: {
            titulo: s.service.title,
            usuario: { nombre: s.service.user.name, email: s.service.user.email },
            categoria: { nombre: '' },
        },
    };
}

export const getHistorialPagos = cache(
    async (page = 1, limit = 10, startDate?: string, endDate?: string, countryCode?: string) => {
        const emptyResult = {
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

        try {
            const token = await getAuthToken();
            const qs = new URLSearchParams({
                page: String(page),
                limit: String(limit),
                ...(startDate ? { startDate } : {}),
                ...(endDate ? { endDate } : {}),
                ...(countryCode ? { countryCode } : {}),
            });

            const result = await apiClient.get<BackendSubscriptionsResponse>(
                `/subscriptions?${qs}`,
                { token, revalidate: 0 },
            );

            return {
                data: result.data.map(mapSuscripcion),
                meta: result.meta,
                stats: result.stats,
            };
        } catch (error) {
            console.error('Error obteniendo historial de pagos:', error);
            return emptyResult;
        }
    },
);

export const getSuscripcionActiva = cache(async () => {
    return null;
});

export const getPagoReciente = cache(async () => {
    return null;
});

export const obtenerPreciosPremiumActivos = cache(
    async (countryCode = 'cl'): Promise<PrecioPremium[]> => {
        try {
            const result = await apiClient.get<BackendPrecioDto[]>(
                `/prices?countryCode=${countryCode}`,
                {
                    revalidate: 300,
                    tags: [`precios-premium-${countryCode}`],
                },
            );
            return (result ?? []).map(mapPrecioDto);
        } catch (error) {
            console.error('Error obteniendo precios premium:', error);
            return [];
        }
    },
);

export const getCountriesActivos = cache(async (): Promise<Country[]> => {
    try {
        const result = await apiClient.get<Country[]>('/geo/countries', {
            revalidate: 3600,
            tags: ['countries'],
        });
        return result ?? [];
    } catch {
        return [];
    }
});

export const getAdminPreciosPremium = cache(
    async (page = 1, limit = 10, _search?: string, countryCode?: string) => {
        try {
            const token = await getAuthToken();
            const url = countryCode ? `/prices?countryCode=${countryCode}` : '/prices';
            const result = await apiClient.get<BackendPrecioDtoWithCountry[]>(url, {
                token,
                revalidate: 0,
            });
            const data = (result ?? []).map((p) =>
                mapPrecioDtoWithCountry(p, countryCode),
            );
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

/**
 * Obtiene todos los precios de todos los países activos y los agrupa por duración.
 * Retorna un Map: durationMonths → PrecioPremium[]
 */
export const getAdminPreciosPorDuracion = cache(async () => {
    try {
        const token = await getAuthToken();
        const countries = await getAdminCountries();

        // Obtener precios de todos los países en paralelo
        const resultsByCountry = await Promise.all(
            countries.map(async (country) => {
                try {
                    const result = await apiClient.get<BackendPrecioDtoWithCountry[]>(
                        `/prices?countryCode=${country.code}`,
                        { token, revalidate: 0 },
                    );
                    return { country, precios: result ?? [] };
                } catch {
                    return { country, precios: [] };
                }
            }),
        );

        // Agrupar por duración (cualquier valor 1–12, sin restricción)
        const byDuration = new Map<number, PrecioPremium[]>();

        for (const { country, precios } of resultsByCountry) {
            for (const p of precios) {
                if (!byDuration.has(p.durationMonths)) {
                    byDuration.set(p.durationMonths, []);
                }
                byDuration.get(p.durationMonths)!.push(
                    mapPrecioDtoWithCountry(p, country.code, country.name),
                );
            }
        }

        return { byDuration, countries };
    } catch (error) {
        console.error('Error obteniendo precios agrupados:', error);
        return {
            byDuration: new Map<number, PrecioPremium[]>(),
            countries: [] as Country[],
            duraciones: [1, 3, 6, 12] as const,
        };
    }
});
