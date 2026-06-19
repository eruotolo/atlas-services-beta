import { ApiError, apiClient } from '@/lib/api/apiClient';
import type { BackendAuthResponse, BackendRefreshResponse } from '@/lib/api/backendTypes';

export async function validateUserCredentials(email: string, password: string) {
    try {
        const data = await apiClient.post<BackendAuthResponse>('/auth/login', { email, password });

        return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            image: data.user.avatar ?? null,
            telefono: data.user.phone ?? null,
            roles: data.user.roles,
            adminCountries: data.user.adminCountries ?? [],
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

/**
 * Resultado discriminado del refresh de token del backend.
 * - `ok`: nuevos tokens emitidos.
 * - `invalid`: refresh token realmente inválido o expirado (401) → invalidar sesión.
 * - `transient`: fallo de red, timeout o 5xx → NO invalidar, reintentar luego.
 */
export type RefreshResult =
    | { status: 'ok'; accessToken: string; refreshToken: string }
    | { status: 'invalid' }
    | { status: 'transient' };

export async function refreshBackendToken(refreshToken: string): Promise<RefreshResult> {
    try {
        const data = await apiClient.post<BackendRefreshResponse>('/auth/refresh', { refreshToken });
        return {
            status: 'ok',
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
        };
    } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
            return { status: 'invalid' };
        }
        // Red, timeout o 5xx: error transitorio. No envenenar la sesión.
        console.error('Error transitorio al renovar token:', error);
        return { status: 'transient' };
    }
}

export async function validateGoogleToken(idToken: string) {
    try {
        const data = await apiClient.post<BackendAuthResponse>('/auth/google', { idToken });

        return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            image: data.user.avatar ?? null,
            telefono: data.user.phone ?? null,
            roles: data.user.roles,
            adminCountries: data.user.adminCountries ?? [],
            backendToken: data.accessToken,
            backendRefreshToken: data.refreshToken,
        };
    } catch (error) {
        console.error('Error en validación de token Google:', error);
        return null;
    }
}

export async function validateAppleToken(idToken: string) {
    try {
        const data = await apiClient.post<BackendAuthResponse>('/auth/apple', { idToken });

        return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            image: data.user.avatar ?? null,
            telefono: data.user.phone ?? null,
            roles: data.user.roles,
            adminCountries: data.user.adminCountries ?? [],
            backendToken: data.accessToken,
            backendRefreshToken: data.refreshToken,
        };
    } catch (error) {
        console.error('Error en validación de token Apple:', error);
        return null;
    }
}

export async function validateMicrosoftToken(accessToken: string) {
    try {
        const data = await apiClient.post<BackendAuthResponse>('/auth/microsoft', { accessToken });

        return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            image: data.user.avatar ?? null,
            telefono: data.user.phone ?? null,
            roles: data.user.roles,
            adminCountries: data.user.adminCountries ?? [],
            backendToken: data.accessToken,
            backendRefreshToken: data.refreshToken,
        };
    } catch (error) {
        console.error('Error en validación de token Microsoft:', error);
        return null;
    }
}
