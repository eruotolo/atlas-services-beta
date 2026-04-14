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
        // 1. Manejo del Login inicial (Credenciales via authorize OR Google via account.provider)
        async jwt({ token, user, account }) {
            // Si el objeto account está presente, significa que es el primer inicio de sesión/generación del token
            if (account) {
                if (account.provider === 'credentials' && user) {
                    // Datos vienen del bloque authorize de Credenciales
                    token.id = user.id;
                    token.roles = (user as any).roles ?? [];
                    token.telefono = (user as any).telefono ?? null;
                    token.backendToken = (user as any).backendToken ?? '';
                    token.backendRefreshToken = (user as any).backendRefreshToken ?? '';
                    token.backendTokenExpires = Date.now() + BACKEND_ACCESS_TOKEN_TTL_MS;
                    return token;
                }

                if (account.provider === 'google' && account.id_token) {
                    // Cuidado: el signIn callback no puede pasar datos al jwt. Se debe hacer aquí.
                    const backendUser = await validateGoogleToken(account.id_token);
                    if (backendUser) {
                        token.id = backendUser.id;
                        token.roles = backendUser.roles ?? [];
                        token.telefono = backendUser.telefono ?? null;
                        token.backendToken = backendUser.backendToken ?? '';
                        token.backendRefreshToken = backendUser.backendRefreshToken ?? '';
                        token.backendTokenExpires = Date.now() + BACKEND_ACCESS_TOKEN_TTL_MS;
                    } else {
                        // Si falla la validación en backend, marcamos error
                        token.error = 'GoogleBackendError';
                    }
                    return token;
                }
            }

            // Token vigente: devolver sin cambios
            const expiresAt = (token.backendTokenExpires as number) ?? 0;
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
        // El signIn callback simple ahora solo valida que no hubo errores
        async signIn({ account }) {
            // Siempre permite el paso a la etapa jwt() donde hacemos nuestro exchange
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
