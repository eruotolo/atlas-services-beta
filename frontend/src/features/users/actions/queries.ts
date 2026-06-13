'use server';

import { cache } from 'react';

import { apiClient } from '@/lib/api/apiClient';
import type { BackendServiceDto } from '@/lib/api/backendTypes';
import { getAuthToken } from '@/shared/lib/auth/getAuthToken';

// Tipos internos del backend de usuarios
interface BackendUserItem {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    avatar?: string | null;
    createdAt?: string;
    roles?: Array<{
        id: string;
        roleId: string;
        role: { name: string };
        country?: { code: string; name: string } | null;
    }>;
    _count?: { services?: number; ratings?: number };
}

// ─── Admin: listar usuarios con paginación ────────────────────────────────────

export const getUsersAll = cache(async (countryCode?: string) => {
    try {
        const url = countryCode ? `/users?limit=999&country=${countryCode}` : '/users?limit=999';
        const result = await apiClient.get<{ items: BackendUserItem[] }>(url);
        return (result.items ?? []).map((u) => ({
            id: u.id,
            nombre: u.name,
            email: u.email,
        }));
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        return [];
    }
});

export const getUsers = cache(async (page = 1, limit = 10, search?: string, roleNames?: string[], countryCode?: string) => {
    try {
        const qs = new URLSearchParams({
            page: String(page),
            limit: String(limit),
            ...(search ? { query: search } : {}),
            ...(roleNames?.length ? { roles: roleNames.join(',') } : {}),
            ...(countryCode ? { country: countryCode } : {}),
        });
        const result = await apiClient.get<{
            items: BackendUserItem[];
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        }>(`/users?${qs}`, { revalidate: 0 });

        return {
            data: (result.items ?? []).map((u) => ({
                id: u.id,
                nombre: u.name,
                email: u.email,
                telefono: u.phone ?? null,
                roles: (u.roles ?? []).map((ur) => ({
                    id: ur.id,
                    roleId: ur.roleId,
                    role: { nombre: ur.role.name ?? '' },
                    country: ur.country ?? null,
                })),
                _count: {
                    servicios: u._count?.services ?? 0,
                    calificaciones: u._count?.ratings ?? 0,
                },
            })),
            meta: {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: result.totalPages,
            },
        };
    } catch (error) {
        console.error('Error al obtener usuarios paginados:', error);
        return { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };
    }
});

export const getAdminUsers = getUsers;

export const getRoles = cache(async () => {
    try {
        const roles = await apiClient.get<{ id: string; name: string }[]>('/users/roles', {
            revalidate: 3600,
        });
        return roles.map((r) => ({ id: r.id, nombre: r.name }));
    } catch (error) {
        console.error('Error al obtener roles:', error);
        return [];
    }
});

// ─── Perfil del usuario autenticado ──────────────────────────────────────────

export const getUserProfile = cache(async () => {
    try {
        const token = await getAuthToken();
        if (!token) return null;
        return await apiClient.get<{
            id: string;
            name: string;
            email: string;
            phone?: string | null;
            avatar?: string | null;
        }>('/users/me', { token, revalidate: 0 });
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        return null;
    }
});

// ─── Datos del perfil + servicios propios ─────────────────────────────────────

export const getProfilePageData = cache(async (userId: string) => {
    try {
        const token = await getAuthToken();
        if (!token) return null;

        const [user, services] = await Promise.all([
            apiClient.get<BackendUserItem>(`/users/${userId}`, { token }),
            apiClient.get<BackendServiceDto[]>(`/users/${userId}/services`, { token }),
        ]);

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone ?? null,
            avatar: user.avatar ?? null,
            servicios: services.map((s) => ({
                id: s.id,
                titulo: s.title,
                categoria: s.categories[0]?.name ?? '',
                categoriaId: s.categories[0]?.id ?? '',
                categories: s.categories.map((c) => ({ id: c.id, nombre: c.name })),
                descripcion: s.description,
                precio: Number(s.price),
                comuna: s.commune,
                imagenPrincipal: s.mainImage ?? null,
                imagenes: s.images,
                nombreContacto: s.contactName ?? null,
                emailContacto: s.contactEmail ?? null,
                telefonoContacto: s.contactPhone ?? null,
                redesSociales: (s.socialNetworks ?? []).map((rs) => ({
                    tipo: rs.tipo as
                        | 'WEBSITE'
                        | 'FACEBOOK'
                        | 'INSTAGRAM'
                        | 'LINKEDIN'
                        | 'TIKTOK'
                        | 'TWITTER'
                        | 'YOUTUBE'
                        | 'OTRO',
                    url: rs.url,
                })),
                activo: s.active,
                destacado: s.featured,
                nivel: (s.level === 'PREMIUM' ? 'PREMIUM' : 'BASICO') as 'BASICO' | 'PREMIUM',
                fechaInicio: new Date(s.startDate),
                fechaFin: s.endDate ? new Date(s.endDate) : new Date(),
                suscripcion: null,
            })),
            stats: {
                totalServicios: services.length,
                totalCalificaciones: 0,
                premiumCount: services.filter((s) => s.level === 'PREMIUM').length,
            },
        };
    } catch (error) {
        console.error('Error al obtener datos del perfil:', error);
        return null;
    }
});

// ─── Usuario por ID ───────────────────────────────────────────────────────────

export async function getUsuarioById(id: string) {
    try {
        return await apiClient.get<{
            id: string;
            name: string;
            email: string;
            phone?: string | null;
        }>(`/users/${id}`);
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        return null;
    }
}
