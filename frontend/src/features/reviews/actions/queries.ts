'use server';

import { cache } from 'react';

import { apiClient } from '@/lib/api/apiClient';
import { getAuthToken } from '@/shared/lib/auth/getAuthToken';

type BackendCommentStatus = 'PENDING' | 'ACTIVE' | 'DELETED';
type FrontendEstado = 'PENDIENTE' | 'ACTIVO' | 'ELIMINADO';

const statusMap: Record<BackendCommentStatus, FrontendEstado> = {
    PENDING: 'PENDIENTE',
    ACTIVE: 'ACTIVO',
    DELETED: 'ELIMINADO',
};

interface BackendRatingItem {
    id: string;
    stars: number;
    comment: string | null;
    status: BackendCommentStatus;
    createdAt: string;
    user: { id: string; name: string; email: string; avatar?: string | null };
    service: { id: string; title: string };
}

// Admin: listado paginado de todas las calificaciones
export const getTodasCalificaciones = cache(
    async (page = 1, limit = 10, search?: string, countryCode?: string) => {
    try {
        const token = await getAuthToken();
        const qs = new URLSearchParams({
            page: String(page),
            limit: String(limit),
            ...(search ? { query: search } : {}),
            ...(countryCode ? { countryCode } : {}),
        });

        const result = await apiClient.get<{
            data: BackendRatingItem[];
            meta: { total: number; page: number; limit: number; totalPages: number };
        }>(`/ratings?${qs}`, { token, revalidate: 0 });

        return {
            data: result.data.map((item) => ({
                id: item.id,
                estrellas: item.stars,
                comentario: item.comment,
                estado: statusMap[item.status],
                createdAt: new Date(item.createdAt),
                usuario: { nombre: item.user.name, email: item.user.email },
                servicio: { id: item.service.id, titulo: item.service.title },
            })),
            meta: result.meta,
        };
    } catch (error) {
        console.error('Error obteniendo calificaciones:', error);
        return {
            data: [],
            meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
        };
    }
    },
);
