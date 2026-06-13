'use server';

import { revalidatePath } from 'next/cache';

import { apiClient } from '@/lib/api/apiClient';
import { getAuthToken } from '@/shared/lib/auth/getAuthToken';

export async function toggleFavorito(serviceId: string, addToFavorites: boolean) {
    const token = await getAuthToken();
    if (!token) return { error: 'Debes iniciar sesión para guardar favoritos.' };

    try {
        if (addToFavorites) {
            await apiClient.post(`/users/me/favorites/${serviceId}`, {}, { token });
        } else {
            await apiClient.delete(`/users/me/favorites/${serviceId}`, { token });
        }

        revalidatePath('/profile/favoritos');
        return { success: true };
    } catch (error) {
        console.error('Error toggling favorito:', error);
        return { error: 'Error al actualizar favoritos.' };
    }
}
