import { apiClient } from '@/shared/lib/apiClient';

export async function addFavorite(serviceId: string): Promise<void> {
    await apiClient.post(`/users/me/favorites/${serviceId}`);
}

export async function removeFavorite(serviceId: string): Promise<void> {
    await apiClient.delete(`/users/me/favorites/${serviceId}`);
}

export async function checkFavorite(serviceId: string): Promise<boolean> {
    const res = await apiClient.get<{ isFavorite: boolean }>(`/users/me/favorites/${serviceId}/check`);
    return res.isFavorite;
}
