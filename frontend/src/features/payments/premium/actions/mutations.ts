'use server';

import { revalidatePath } from 'next/cache';

import { apiClient } from '@/lib/api/apiClient';
import { getAuthToken } from '@/shared/lib/auth/getAuthToken';

import type { PremiumPriceInput, PremiumPriceUpdateInput } from '../../types/paymentTypes';

export async function subscribeToPremium(_data: unknown) {
    return { success: true };
}

export async function crearPrecioPremium(
    data: PremiumPriceInput,
): Promise<{ success: boolean; error?: string }> {
    const token = await getAuthToken();
    if (!token) return { success: false, error: 'No autorizado' };

    try {
        await apiClient.post(
            '/prices',
            {
                countryId: data.countryId,
                duracionMeses: data.duracionMeses,
                precio: data.precio,
                currency: data.currency,
                descripcion: data.descripcion,
            },
            { token },
        );

        revalidatePath('/config/premium-prices');
        revalidatePath('/admin/precios-premium');
        return { success: true };
    } catch (error) {
        console.error('Error al crear precio premium:', error);
        return { success: false, error: 'Error al crear el precio premium' };
    }
}

export async function actualizarPrecioPremium(
    data: PremiumPriceUpdateInput,
): Promise<{ success: boolean; error?: string }> {
    const token = await getAuthToken();
    if (!token) return { success: false, error: 'No autorizado' };

    try {
        await apiClient.patch(
            `/prices/${data.id}`,
            {
                ...(data.duracionMeses !== undefined && { duracionMeses: data.duracionMeses }),
                ...(data.precio !== undefined && { precio: data.precio }),
                ...(data.currency !== undefined && { currency: data.currency }),
                ...(data.descripcion !== undefined && { descripcion: data.descripcion }),
            },
            { token },
        );

        revalidatePath('/config/premium-prices');
        revalidatePath('/admin/precios-premium');
        return { success: true };
    } catch (error) {
        console.error('Error al actualizar precio premium:', error);
        return { success: false, error: 'Error al actualizar el precio premium' };
    }
}

export async function eliminarPrecioPremium(
    id: string,
): Promise<{ success: boolean; error?: string }> {
    const token = await getAuthToken();
    if (!token) return { success: false, error: 'No autorizado' };

    try {
        await apiClient.delete(`/prices/${id}`, { token });
        revalidatePath('/config/premium-prices');
        revalidatePath('/admin/precios-premium');
        return { success: true };
    } catch (error) {
        console.error('Error al eliminar precio premium:', error);
        return { success: false, error: 'Error al eliminar el precio premium' };
    }
}

export async function toggleActivoPrecioPremium(
    id: string,
): Promise<{ success: boolean; error?: string }> {
    const token = await getAuthToken();
    if (!token) return { success: false, error: 'No autorizado' };

    try {
        await apiClient.patch(`/prices/${id}`, { activo: null }, { token });

        revalidatePath('/config/premium-prices');
        revalidatePath('/admin/precios-premium');
        return { success: true };
    } catch (error) {
        console.error('Error al cambiar estado de precio premium:', error);
        return { success: false, error: 'Error al cambiar el estado del precio premium' };
    }
}
