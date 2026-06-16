import { apiClient } from '@/shared/lib/apiClient';
import type { PrecioPremium, Suscripcion } from '../types';

interface BackendPrecioDto {
    id: string;
    durationMonths: number;
    price: number;
    currency: string;
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
        currency: p.currency,
    };
}

export async function getActivePremiumPrices(countryCode: string): Promise<readonly PrecioPremium[]> {
    const result = await apiClient.get<readonly BackendPrecioDto[]>(`/prices?countryCode=${countryCode}`);
    return (result ?? []).map(mapPrecioDto);
}

export async function getPaymentHistory(params?: { page?: number; limit?: number }): Promise<{ data: Suscripcion[]; meta: any }> {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));

    // Stub endpoint for now, assumes standard list response
    const result = await apiClient.get<any>(`/subscriptions?${qs}`);
    return result;
}
