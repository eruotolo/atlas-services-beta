'use server';

import { apiClient } from '@/lib/api/apiClient';
import { getAuthToken } from '@/shared/lib/auth/getAuthToken';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface KycStatus {
    isKycVerified: boolean;
    kycVerifiedAt: string | null;
}

interface BackendMeResponse {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    avatar?: string | null;
    isKycVerified?: boolean;
    kycVerifiedAt?: string | null;
}

interface KycSessionResponse {
    client_secret: string;
    url: string;
}

// ─── Obtener estado KYC del usuario autenticado ───────────────────────────────

export async function getKycStatus(): Promise<KycStatus | null> {
    try {
        const token = await getAuthToken();
        if (!token) return null;

        const me = await apiClient.get<BackendMeResponse>('/users/me', {
            token,
            revalidate: 0,
        });

        return {
            isKycVerified: me.isKycVerified ?? false,
            kycVerifiedAt: me.kycVerifiedAt ?? null,
        };
    } catch (error) {
        console.error('[KYC] Error al obtener estado KYC:', error);
        // Devuelve null si el endpoint no existe o hay error, sin romper la página
        return null;
    }
}

// ─── Iniciar sesión KYC con Stripe Identity ───────────────────────────────────

export async function initiateKycSession(): Promise<{ url: string } | { error: string }> {
    try {
        const token = await getAuthToken();
        if (!token) {
            return { error: 'No hay sesión activa. Por favor, inicia sesión.' };
        }

        const response = await apiClient.post<KycSessionResponse>(
            '/kyc/session',
            {},
            { token },
        );

        if (!response?.url) {
            return { error: 'No se pudo obtener la URL de verificación. Intentá de nuevo.' };
        }

        return { url: response.url };
    } catch (error) {
        console.error('[KYC] Error al iniciar sesión KYC:', error);
        const message =
            error instanceof Error ? error.message : 'Error al iniciar la verificación.';
        return { error: message };
    }
}
