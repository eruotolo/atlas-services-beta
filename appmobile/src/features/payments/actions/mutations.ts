import { apiClient } from '@/shared/lib/apiClient';
import type { PaymentIntentResponse } from '../types';

export interface CreatePaymentParams {
    servicioId: string;
    duracionMeses: number;
    gateway: 'stripe' | 'mercadopago';
}

export async function createPremiumPayment(data: CreatePaymentParams): Promise<{ success: boolean; data?: PaymentIntentResponse; error?: string }> {
    try {
        const result = await apiClient.post<PaymentIntentResponse>('/payments/premium', data);
        return { success: true, data: result };
    } catch (error: any) {
        return { success: false, error: error?.message || 'Error al iniciar el pago' };
    }
}
