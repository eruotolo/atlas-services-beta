import { apiClient } from '@/shared/lib/apiClient';
import type { AvailableLead, SentQuote } from '../types/leads';

export async function getAvailableLeads(): Promise<readonly AvailableLead[]> {
    return apiClient.get<readonly AvailableLead[]>('/service-requests/available');
}

export async function getMySentQuotes(): Promise<readonly SentQuote[]> {
    return apiClient.get<readonly SentQuote[]>('/quotes/my-quotes');
}

export async function submitQuote(params: {
    serviceRequestId: string;
    price: number;
    message: string;
}): Promise<{ success: boolean; error?: string }> {
    try {
        await apiClient.post('/quotes', params);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error?.message || 'No se pudo enviar la cotización' };
    }
}
