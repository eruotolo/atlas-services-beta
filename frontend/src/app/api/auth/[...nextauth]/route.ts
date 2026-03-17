import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

import { refreshBackendToken, validateUserCredentials } from '@/features/auth/lib/auth.service';

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
    ],
    callbacks: {
        async jwt({ token, user }) {
            // Primera vez: datos vienen del authorize
            if (user) {
                token.id = user.id;
                token.roles = user.roles;
                token.telefono = user.telefono;
                token.backendToken = user.backendToken;
                token.backendRefreshToken = user.backendRefreshToken;
                token.backendTokenExpires = Date.now() + BACKEND_ACCESS_TOKEN_TTL_MS;
                return token;
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
