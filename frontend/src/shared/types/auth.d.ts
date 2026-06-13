import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            roles: string[];
            adminCountries?: string[];
            telefono?: string | null;
            nivelSuscripcion?: string;
            backendToken: string;
            backendRefreshToken: string;
        } & DefaultSession['user'];
        error?: string;
    }

    interface User {
        id: string;
        email: string;
        name: string;
        roles: string[];
        adminCountries?: string[];
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
        adminCountries?: string[];
        telefono?: string | null;
        nivelSuscripcion?: string;
        backendToken: string;
        backendRefreshToken: string;
        backendTokenExpires?: number;
        error?: string;
    }
}
