'use server';

import { revalidatePath } from 'next/cache';
import { apiClient } from '@/lib/api/apiClient';

export async function updateCountryPayments(code: string, paymentsEnabled: boolean) {
    try {
        await apiClient.patch(`/geo/countries/${code}`, { paymentsEnabled });
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (e) {
        console.error('Error updating country payments:', e);
        return { success: false };
    }
}
