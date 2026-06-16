import { apiClient } from '@/shared/lib/apiClient';
import type { FavoriteService } from '@/features/profile/types';
import type { ServiceListItem } from '@/features/services/types';

interface FavoritesResponse {
    readonly favorites: readonly ServiceListItem[];
}

export async function getFavorites(): Promise<readonly FavoriteService[]> {
    const res = await apiClient.get<FavoritesResponse>('/users/me/favorites');
    return res.favorites.map((f) => ({
        id: f.slug,
        name: f.title,
        rating: f.rating,
        imageUrl: f.imagenPrincipal ?? '',
    }));
}

export async function getFavoriteIds(): Promise<ReadonlySet<string>> {
    const res = await apiClient.get<FavoritesResponse>('/users/me/favorites');
    return new Set(res.favorites.map((f) => f.slug));
}
