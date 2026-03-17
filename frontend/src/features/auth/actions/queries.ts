'use server';

import { getServerSession } from 'next-auth';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * Obtiene el usuario actualmente autenticado
 */
export async function getCurrentUser() {
    const session = await getServerSession(authOptions);
    return session?.user || null;
}

/**
 * Verifica si el usuario actual tiene un rol específico
 */
export async function hasRole(roleName: string): Promise<boolean> {
    const session = await getServerSession(authOptions);
    return session?.user?.roles?.includes(roleName) || false;
}

/**
 * Verifica si el usuario actual es SuperAdministrador
 */
export async function isSuperAdmin(): Promise<boolean> {
    return hasRole('SuperAdministrador');
}
