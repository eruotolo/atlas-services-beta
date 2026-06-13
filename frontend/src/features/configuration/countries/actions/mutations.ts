'use server';

import { revalidatePath } from 'next/cache';

import { apiClient } from '@/lib/api/apiClient';
import { getAuthToken } from '@/shared/lib/auth/getAuthToken';

import { countryCreateSchema, countryUpdateSchema } from '../schemas/countrySchemas';
import type { CountryCreateInput, CountryUpdateInput } from '../schemas/countrySchemas';

export async function crearPais(data: CountryCreateInput) {
    const token = await getAuthToken();
    const validated = countryCreateSchema.parse(data);

    try {
        const country = await apiClient.post('/geo/countries', validated, { token });
        revalidatePath('/config/countries');
        return { success: true, country };
    } catch (error) {
        console.error('Error al crear país:', error);
        return { error: 'Error al crear el país. El código puede estar en uso.' };
    }
}

export async function actualizarPais(code: string, data: CountryUpdateInput) {
    const token = await getAuthToken();
    const validated = countryUpdateSchema.parse(data);

    try {
        const country = await apiClient.patch(`/geo/countries/${code}`, validated, { token });
        revalidatePath('/config/countries');
        return { success: true, country };
    } catch (error) {
        console.error('Error al actualizar país:', error);
        return { error: 'Error al actualizar el país' };
    }
}

export async function toggleActivoPais(code: string, active: boolean) {
    const token = await getAuthToken();

    try {
        const country = await apiClient.patch(`/geo/countries/${code}`, { active }, { token });
        revalidatePath('/config/countries');
        return { success: true, country };
    } catch (error) {
        console.error('Error al cambiar estado del país:', error);
        return { error: 'Error al cambiar el estado del país' };
    }
}

export async function updateCountryPayments(code: string, paymentsEnabled: boolean) {
    const token = await getAuthToken();

    try {
        await apiClient.patch(`/geo/countries/${code}`, { paymentsEnabled }, { token });
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        console.error('Error updating country payments:', error);
        return { success: false };
    }
}
