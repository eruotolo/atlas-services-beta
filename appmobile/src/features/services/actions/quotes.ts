import { apiClient } from '@/shared/lib/apiClient';
import type { BackendQuote, BackendServiceRequest } from '../types/quotes';

export async function getMyServiceRequests(): Promise<readonly BackendServiceRequest[]> {
    return apiClient.get<readonly BackendServiceRequest[]>('/service-requests');
}

export async function getQuotesByRequest(serviceRequestId: string): Promise<readonly BackendQuote[]> {
    return apiClient.get<readonly BackendQuote[]>(`/quotes/request/${serviceRequestId}`);
}

export async function acceptQuote(quoteId: string): Promise<{ success: boolean; error?: string }> {
    try {
        await apiClient.patch(`/quotes/${quoteId}/accept`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error?.message || 'No se pudo aceptar la cotización' };
    }
}
