'use server';

import { apiClient } from '@/lib/api/apiClient';
import { getAuthToken } from '@/shared/lib/auth/getAuthToken';

import type { EscrowCheckoutResponse } from '../types/quotes';

/**
 * Inicia el checkout de escrow para una cotización aceptada.
 * Llama a POST /api/v1/escrow/checkout con { quoteId }.
 * Devuelve los datos de pago o un objeto { error }.
 */
export async function initiateEscrowCheckout(
    quoteId: string,
): Promise<EscrowCheckoutResponse | { error: string }> {
    const token = await getAuthToken();
    if (!token) {
        return { error: 'No autenticado. Por favor inicia sesión.' };
    }

    try {
        const data = await apiClient.post<EscrowCheckoutResponse>(
            '/escrow/checkout',
            { quoteId },
            { token },
        );
        return data;
    } catch (error) {
        console.error('[initiateEscrowCheckout]', error);
        const message =
            error instanceof Error ? error.message : 'No se pudo iniciar el pago';
        return { error: message };
    }
}
