'use server';

import { revalidateTag } from 'next/cache';
import { apiClient } from '@/lib/api/apiClient';

export async function updateCountryPayments(code: string, paymentsEnabled: boolean) {
    try {
        await apiClient.patch(`/geo/countries/${code}`, { paymentsEnabled });
        revalidateTag(`country-${code}`);
        return { success: true };
    } catch (e) {
        console.error('Error updating country payments:', e);
        return { success: false };
    }
}
