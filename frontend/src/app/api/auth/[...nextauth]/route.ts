import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

import {
    refreshBackendToken,
    validateGoogleToken,
    validateUserCredentials,
} from '@/features/auth/lib/auth.service';

// Access token dura 15 minutos; refrescamos con 1 minuto de margen
const BACKEND_TOKEN_REFRESH_MARGIN_MS = 60 * 1000;
// Duración del accessToken del backend (15 min en ms)
const BACKEND_ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000;

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

                const user = await validateUserCredentials(
                    credentials.email,
                    credentials.password,
                );
                return user;
            },
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            // Primera vez: datos vienen del authorize (credentials)
            if (user) {
                token.id = user.id;
                token.roles = (user as any).roles ?? [];
                token.telefono = (user as any).telefono ?? null;
                token.backendToken = (user as any).backendToken ?? '';
                token.backendRefreshToken = (user as any).backendRefreshToken ?? '';
                token.backendTokenExpires = Date.now() + BACKEND_ACCESS_TOKEN_TTL_MS;
                return token;
            }

            // Google sign-in: exchange id_token with our backend
            if (token.id === undefined && token.sub && token.email) {
                // First-time Google user — need to exchange token with backend
                // This is handled via the signIn callback below
            }

            // Token vigente: devolver sin cambios
            const expiresAt = token.backendTokenExpires ?? 0;
            if (Date.now() < expiresAt - BACKEND_TOKEN_REFRESH_MARGIN_MS) {
                return token;
            }

            // Token próximo a vencer: intentar refrescar
            const refreshed = await refreshBackendToken(token.backendRefreshToken as string);
            if (!refreshed) {
                // Forzar re-login eliminando el token del backend
                return {
                    ...token,
                    backendToken: '',
                    backendRefreshToken: '',
                    error: 'RefreshTokenExpired',
                };
            }

            return {
                ...token,
                backendToken: refreshed.accessToken,
                backendRefreshToken: refreshed.refreshToken,
                backendTokenExpires: Date.now() + BACKEND_ACCESS_TOKEN_TTL_MS,
            };
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.roles = token.roles as string[];
                session.user.telefono = token.telefono as string | null | undefined;
                session.user.backendToken = token.backendToken as string;
                session.user.backendRefreshToken = token.backendRefreshToken as string;
            }
            return session;
        },
        async signIn({ user, account }) {
            // For Google sign-in, exchange the id_token with our backend
            if (account?.provider === 'google' && account.id_token) {
                const backendUser = await validateGoogleToken(account.id_token);
                if (!backendUser) return false;

                // Attach backend data to the user object for the jwt callback
                (user as any).id = backendUser.id;
                (user as any).roles = backendUser.roles;
                (user as any).telefono = backendUser.telefono;
                (user as any).backendToken = backendUser.backendToken;
                (user as any).backendRefreshToken = backendUser.backendRefreshToken;
            }
            return true;
        },
        async redirect({ url, baseUrl }) {
            if (url.startsWith(baseUrl)) {
                return url;
            }
            return `${baseUrl}/perfil`;
        },
    },
    pages: { signIn: '/login' },
    session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
    secret: process.env.AUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
