'use server';

import { revalidatePath } from 'next/cache';

import { apiClient } from '@/lib/api/apiClient';
import { getAuthToken } from '@/shared/lib/auth/getAuthToken';

import type { BackendQuote, BackendServiceRequest } from '../types/quotes';

export async function getMyServiceRequests(): Promise<BackendServiceRequest[]> {
    const token = await getAuthToken();
    if (!token) return [];

    try {
        const requests = await apiClient.get<BackendServiceRequest[]>('/service-requests', {
            token,
            revalidate: 0,
        });
        return Array.isArray(requests) ? requests : [];
    } catch (error) {
        console.error('[getMyServiceRequests]', error);
        return [];
    }
}

export async function getQuotesByRequest(serviceRequestId: string): Promise<BackendQuote[]> {
    const token = await getAuthToken();
    if (!token) return [];

    try {
        const quotes = await apiClient.get<BackendQuote[]>(
            `/quotes/request/${serviceRequestId}`,
            { token, revalidate: 0 },
        );
        return Array.isArray(quotes) ? quotes : [];
    } catch (error) {
        console.error('[getQuotesByRequest]', error);
        return [];
    }
}

export async function acceptQuote(
    quoteId: string,
    countryCode: string,
): Promise<{ success: boolean; error?: string }> {
    const token = await getAuthToken();
    if (!token) return { success: false, error: 'No autenticado' };

    try {
        await apiClient.patch(`/quotes/${quoteId}/accept`, {}, { token });
        revalidatePath(`/${countryCode}/profile/quotes`);
        return { success: true };
    } catch (error) {
        console.error('[acceptQuote]', error);
        return { success: false, error: 'No se pudo aceptar la cotización' };
    }
}
