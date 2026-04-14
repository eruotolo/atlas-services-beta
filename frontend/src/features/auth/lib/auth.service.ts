import { ApiError, apiClient } from '@/lib/api/apiClient';
import type { BackendAuthResponse, BackendRefreshResponse } from '@/lib/api/backendTypes';

export async function validateUserCredentials(email: string, password: string) {
    try {
        const data = await apiClient.post<BackendAuthResponse>('/auth/login', { email, password });

        return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            telefono: data.user.phone ?? null,
            roles: data.user.roles,
            backendToken: data.accessToken,
            backendRefreshToken: data.refreshToken,
        };
    } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
            return null;
        }
        console.error('Error en validación de credenciales:', error);
        return null;
    }
}

export async function refreshBackendToken(refreshToken: string) {
    try {
        const data = await apiClient.post<BackendRefreshResponse>('/auth/refresh', { refreshToken });
        return {
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
        };
    } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
            return null;
        }
        console.error('Error al renovar token:', error);
        return null;
    }
}

export async function validateGoogleToken(idToken: string) {
    try {
        const data = await apiClient.post<BackendAuthResponse>('/auth/google', { idToken });

        return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            telefono: data.user.phone ?? null,
            roles: data.user.roles,
            backendToken: data.accessToken,
            backendRefreshToken: data.refreshToken,
        };
    } catch (error) {
        console.error('Error en validación de token Google:', error);
        return null;
    }
}
