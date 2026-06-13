'use client';

import { useParams } from 'next/navigation';

/**
 * Hook para Client Components.
 * Extrae el country del contexto de rutas actual y retorna
 * una función que prefija cualquier path con el código de país.
 *
 * Uso: const link = useCountryLink(); <Link href={link('/search')} />
 */
export function useCountryLink() {
    const params = useParams();
    const country = (params?.country as string) ?? 'cl';
    return (path: string) => `/${country}${path}`;
}
