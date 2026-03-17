import { getServerSession } from 'next-auth';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * Obtiene el Bearer token del backend desde la sesión de Auth.js.
 * Solo puede usarse en Server Actions o Route Handlers (server-side).
 */
export async function getAuthToken(): Promise<string | undefined> {
    const session = await getServerSession(authOptions);
    return (session?.user as { backendToken?: string } | undefined)?.backendToken;
}
