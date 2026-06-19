import NextAuth, { type NextAuthOptions } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import AppleProvider from 'next-auth/providers/apple';
import AzureADProvider from 'next-auth/providers/azure-ad';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

import {
    refreshBackendToken,
    validateAppleToken,
    validateGoogleToken,
    validateMicrosoftToken,
    validateUserCredentials,
} from '@/features/auth/lib/auth.service';

const BACKEND_TOKEN_REFRESH_MARGIN_MS = 60 * 1000;
const BACKEND_ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000;

function getBackendTokenExpiry(accessToken: string): number {
    try {
        const payload = accessToken.split('.')[1];
        const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString()) as {
            exp?: number;
        };
        if (typeof decoded.exp === 'number') return decoded.exp * 1000;
    } catch {
        // payload ilegible: usar fallback
    }
    return Date.now() + BACKEND_ACCESS_TOKEN_TTL_MS;
}

function applyBackendUser(
    token: JWT,
    backendUser: {
        id: string;
        roles: string[];
        adminCountries?: string[];
        telefono: string | null;
        backendToken: string;
        backendRefreshToken: string;
    } | null,
    errorKey: string,
): JWT {
    if (!backendUser) return { ...token, error: errorKey };
    return {
        ...token,
        id: backendUser.id,
        roles: backendUser.roles ?? [],
        adminCountries: backendUser.adminCountries ?? [],
        phone: backendUser.telefono ?? null,
        backendToken: backendUser.backendToken ?? '',
        backendRefreshToken: backendUser.backendRefreshToken ?? '',
        backendTokenExpires: getBackendTokenExpiry(backendUser.backendToken ?? ''),
        error: undefined,
    };
}

async function handleFirstLogin(
    token: JWT,
    user: unknown,
    account: { provider: string; id_token?: string; access_token?: string },
): Promise<JWT> {
    if (account.provider === 'credentials' && user) {
        const u = user as Record<string, any>;
        return {
            ...token,
            id: u.id,
            roles: u.roles ?? [],
            adminCountries: u.adminCountries ?? [],
            phone: u.phone ?? null,
            picture: u.image ?? null,
            backendToken: u.backendToken ?? '',
            backendRefreshToken: u.backendRefreshToken ?? '',
            backendTokenExpires: getBackendTokenExpiry((u.backendToken as string) ?? ''),
            error: undefined,
        };
    }

    if (account.provider === 'google' && account.id_token) {
        return applyBackendUser(token, await validateGoogleToken(account.id_token), 'GoogleBackendError');
    }

    if (account.provider === 'apple' && account.id_token) {
        return applyBackendUser(token, await validateAppleToken(account.id_token), 'AppleBackendError');
    }

    if (account.provider === 'azure-ad' && account.access_token) {
        return applyBackendUser(
            token,
            await validateMicrosoftToken(account.access_token),
            'MicrosoftBackendError',
        );
    }

    return token;
}

async function maybeRefreshToken(token: JWT): Promise<JWT> {
    const expiresAt = (token.backendTokenExpires as number) ?? 0;
    if (Date.now() < expiresAt - BACKEND_TOKEN_REFRESH_MARGIN_MS) return token;

    const refreshed = await refreshBackendToken(token.backendRefreshToken as string);

    if (refreshed.status === 'ok') {
        return {
            ...token,
            backendToken: refreshed.accessToken,
            backendRefreshToken: refreshed.refreshToken,
            backendTokenExpires: getBackendTokenExpiry(refreshed.accessToken),
            error: undefined,
        };
    }

    if (refreshed.status === 'transient') return token;

    return { ...token, backendToken: '', backendRefreshToken: '', error: 'RefreshTokenExpired' };
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credenciales',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Contraseña', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;
                return validateUserCredentials(credentials.email, credentials.password);
            },
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
        }),
        AppleProvider({
            clientId: process.env.APPLE_ID ?? '',
            clientSecret: process.env.APPLE_SECRET ?? '',
        }),
        AzureADProvider({
            clientId: process.env.AZURE_AD_CLIENT_ID ?? '',
            clientSecret: process.env.AZURE_AD_CLIENT_SECRET ?? '',
            tenantId: process.env.AZURE_AD_TENANT_ID ?? 'common',
        }),
    ],
    callbacks: {
        async jwt({ token, user, account, trigger, session }) {
            if (trigger === 'update' && session?.user) {
                if (session.user.image !== undefined) token.picture = session.user.image;
                if (session.user.name !== undefined) token.name = session.user.name;
                if (session.user.phone !== undefined) token.phone = session.user.phone;
            }
            if (account) return handleFirstLogin(token, user, account);
            return maybeRefreshToken(token);
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.roles = token.roles as string[];
                session.user.adminCountries = (token.adminCountries as string[]) ?? [];
                (session.user as Record<string, unknown>).phone = token.phone as string | null | undefined;
                session.user.backendToken = token.backendToken as string;
                session.user.backendRefreshToken = token.backendRefreshToken as string;
                session.user.image = (token.picture as string) ?? null;
            }
            if (token.error) {
                session.error = token.error as string;
            }
            return session;
        },
        async signIn({ account }) {
            // Permitir siempre credentials; para OAuth, NextAuth completa el flujo
            // y los errores de backend se gestionan en el jwt callback (error en token).
            if (account?.provider === 'credentials') return true;
            return true;
        },
        async redirect({ url, baseUrl }) {
            // Redirigir a la URL solicitada si pertenece a este origen
            if (url.startsWith('/')) return `${baseUrl}${url}`;
            if (url.startsWith(baseUrl)) return url;
            // Fallback sin country (la página de perfil redirigirá al país correcto)
            return `${baseUrl}/profile`;
        },
    },
    pages: { signIn: '/login' },
    session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
    secret: process.env.AUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
