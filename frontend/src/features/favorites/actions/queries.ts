'use server';

import { cache } from 'react';

import { apiClient } from '@/lib/api/apiClient';
import { getAuthToken } from '@/shared/lib/auth/getAuthToken';

interface FavoriteService {
    id: string;
    title: string;
    slug: string;
    description: string;
    price: number;
    commune: string;
    level: string;
    featured: boolean;
    averageRating: number | null;
    totalRatings: number;
    mainImage: string | null;
    endDate: string | null;
    userId: string;
    userName: string;
    userAvatar: string | null;
    categories: Array<{ id: string; name: string; slug: string; icon: string | null }>;
}

interface FavoriteItem {
    id: string;
    savedAt: string;
    service: FavoriteService;
}

const PLACEHOLDER_IMAGE = 'https://placehold.co/600x400/3B82F6/FFFFFF?text=Sin+Imagen';

export const getMisFavoritos = cache(async () => {
    try {
        const token = await getAuthToken();
        if (!token) return [];

        const items = await apiClient.get<FavoriteItem[]>('/users/me/favorites', {
            token,
            revalidate: 0,
        });

        return items.map((f) => ({
            id: f.id,
            savedAt: new Date(f.savedAt),
            service: {
                id: f.service.id,
                slug: f.service.slug,
                userId: f.service.userId,
                userName: f.service.userName,
                userAvatar: f.service.userAvatar,
                title: f.service.title,
                category: f.service.categories[0]?.name ?? 'Sin categoría',
                categories: f.service.categories.map((c) => ({ id: c.id, nombre: c.name })),
                description: f.service.description,
                price: Number(f.service.price),
                comuna: f.service.commune ?? '',
                rating: Number(f.service.averageRating ?? 0),
                reviewsCount: f.service.totalRatings,
                image: f.service.mainImage ?? PLACEHOLDER_IMAGE,
                isPremium: f.service.featured && f.service.level === 'PREMIUM',
            },
        }));
    } catch (error) {
        console.error('Error obteniendo favoritos:', error);
        return [];
    }
});

export const checkIsFavorito = cache(async (serviceId: string) => {
    try {
        const token = await getAuthToken();
        if (!token) return false;

        const result = await apiClient.get<{ isFavorite: boolean }>(
            `/users/me/favorites/${serviceId}/check`,
            { token, revalidate: 0 },
        );

        return result.isFavorite;
    } catch {
        return false;
    }
});
