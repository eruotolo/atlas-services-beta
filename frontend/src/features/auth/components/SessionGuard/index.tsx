'use client';

import { useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';

import { signOut, useSession } from 'next-auth/react';

/**
 * Detecta una sesión inválida (refresh token expirado) y fuerza un signOut limpio.
 * Evita el estado "logueado fantasma": el cliente cree estar autenticado pero el
 * proxy redirige toda navegación a /login, dejando al usuario atrapado.
 */
export function SessionGuard(): null {
    const { data: session } = useSession();
    const params = useParams();
    const signingOut = useRef(false);

    useEffect(() => {
        if (session?.error === 'RefreshTokenExpired' && !signingOut.current) {
            signingOut.current = true;
            const country = (params?.country as string) ?? 'cl';
            void signOut({ callbackUrl: `/${country}/login` });
        }
    }, [session?.error, params?.country]);

    return null;
}
