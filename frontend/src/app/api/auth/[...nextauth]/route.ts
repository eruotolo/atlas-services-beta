import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

import {
    refreshBackendToken,
    validateGoogleToken,
    validateUserCredentials,
} from '@/features/auth/lib/auth.service';

// Refrescamos el access token con 1 minuto de margen antes de su expiración real
const BACKEND_TOKEN_REFRESH_MARGIN_MS = 60 * 1000;
// Fallback si el JWT del backend no trae claim `exp` legible (15 min en ms)
const BACKEND_ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000;

/**
 * Lee la expiración real (claim `exp`) del access token del backend, en ms.
 * Decodifica solo el payload del JWT (sin verificar firma) para no depender de
 * un TTL hardcodeado que pueda desalinearse con la config del backend.
 */
function getBackendTokenExpiry(accessToken: string): number {
    try {
        const payload = accessToken.split('.')[1];
        const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString()) as {
            exp?: number;
        };
        if (typeof decoded.exp === 'number') {
            return decoded.exp * 1000;
        }
    } catch {
        // payload ilegible: usar fallback
    }
    return Date.now() + BACKEND_ACCESS_TOKEN_TTL_MS;
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
                    token.phone = (user as any).phone ?? null;
                    token.backendToken = (user as any).backendToken ?? '';
                    token.backendRefreshToken = (user as any).backendRefreshToken ?? '';
                    token.backendTokenExpires = getBackendTokenExpiry(token.backendToken);
                    token.error = undefined;
                    return token;
                }

                if (account.provider === 'google' && account.id_token) {
                    // Cuidado: el signIn callback no puede pasar datos al jwt. Se debe hacer aquí.
                    const backendUser = await validateGoogleToken(account.id_token);
                    if (backendUser) {
                        token.id = backendUser.id;
                        token.roles = backendUser.roles ?? [];
                        token.phone = backendUser.phone ?? null;
                        token.backendToken = backendUser.backendToken ?? '';
                        token.backendRefreshToken = backendUser.backendRefreshToken ?? '';
                        token.backendTokenExpires = getBackendTokenExpiry(token.backendToken);
                        token.error = undefined;
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

            if (refreshed.status === 'ok') {
                return {
                    ...token,
                    backendToken: refreshed.accessToken,
                    backendRefreshToken: refreshed.refreshToken,
                    backendTokenExpires: getBackendTokenExpiry(refreshed.accessToken),
                    error: undefined,
                };
            }

            // Fallo transitorio (red/timeout/5xx): conservar el token actual y reintentar
            // en la próxima request. NUNCA invalidar la sesión por un error pasajero.
            if (refreshed.status === 'transient') {
                return token;
            }

            // status === 'invalid': refresh token expirado o inválido → forzar re-login
            return {
                ...token,
                backendToken: '',
                backendRefreshToken: '',
                error: 'RefreshTokenExpired',
            };
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.roles = token.roles as string[];
                (session.user as any).phone = token.phone as string | null | undefined;
                session.user.backendToken = token.backendToken as string;
                session.user.backendRefreshToken = token.backendRefreshToken as string;
            }
            // Propagar el error al cliente para que pueda hacer signOut automático
            if (token.error) {
                session.error = token.error as 'RefreshTokenExpired' | 'GoogleBackendError';
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
