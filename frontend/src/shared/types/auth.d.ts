import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            roles: string[];
            telefono?: string | null;
            nivelSuscripcion?: string;
            backendToken: string;
            backendRefreshToken: string;
        } & DefaultSession['user'];
        error?: 'RefreshTokenExpired' | 'GoogleBackendError';
    }

    interface User {
        id: string;
        email: string;
        name: string;
        roles: string[];
        telefono?: string | null;
        nivelSuscripcion?: string;
        backendToken: string;
        backendRefreshToken: string;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        roles: string[];
        telefono?: string | null;
        nivelSuscripcion?: string;
        backendToken: string;
        backendRefreshToken: string;
        backendTokenExpires?: number;
        error?: 'RefreshTokenExpired' | 'GoogleBackendError';
    }
}
