'use server';

import { revalidatePath } from 'next/cache';

import { apiClient } from '@/lib/api/apiClient';
import { getAuthToken } from '@/shared/lib/auth/getAuthToken';

import type { AvailableLead, SentQuote } from '../types/leads';

/** Leads disponibles para cotizar (vista del profesional) */
export async function getAvailableLeads(): Promise<AvailableLead[]> {
    const token = await getAuthToken();
    if (!token) return [];

    try {
        const leads = await apiClient.get<AvailableLead[]>('/service-requests/available', {
            token,
            revalidate: 0,
        });
        return Array.isArray(leads) ? leads : [];
    } catch (error) {
        console.error('[getAvailableLeads]', error);
        return [];
    }
}

/** Cotizaciones ya enviadas por el profesional */
export async function getMySentQuotes(): Promise<SentQuote[]> {
    const token = await getAuthToken();
    if (!token) return [];

    try {
        const quotes = await apiClient.get<SentQuote[]>('/quotes/my-quotes', {
            token,
            revalidate: 0,
        });
        return Array.isArray(quotes) ? quotes : [];
    } catch (error) {
        console.error('[getMySentQuotes]', error);
        return [];
    }
}

/** El profesional envía una cotización a un lead */
export async function submitQuote(
    serviceRequestId: string,
    price: number,
    message: string,
    countryCode: string,
): Promise<{ success: boolean; error?: string }> {
    const token = await getAuthToken();
    if (!token) return { success: false, error: 'No autenticado' };

    try {
        await apiClient.post('/quotes', { serviceRequestId, price, message }, { token });
        revalidatePath(`/${countryCode}/profile/leads`);
        return { success: true };
    } catch (error) {
        console.error('[submitQuote]', error);
        return { success: false, error: 'No se pudo enviar la cotización' };
    }
}
