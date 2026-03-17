import { randomBytes } from 'node:crypto';

import { ApiError, apiClient } from '@/lib/api/apiClient';
import type { BackendAuthResponse } from '@/lib/api/backendTypes';
import {
    enviarEmailCredencialesInvitado,
    enviarEmailCredencialesProveedor,
} from '@/shared/lib/email/email';

export type UserRegistrationData = {
    email: string;
    nombre: string;
    passwordRaw: string;
    telefono?: string | null;
};

export type GuestUserCreationResult = {
    usuario: {
        id: string;
        nombre: string;
        email: string;
        telefono?: string | null;
    };
    passwordGenerado: string;
    usuarioExistia: boolean;
};

/**
 * Genera una contraseña aleatoria segura para usuarios invitados.
 */
export function generarPasswordSeguro(): string {
    return randomBytes(8).toString('hex');
}

/**
 * Registra un usuario estándar vía backend NestJS.
 */
export async function registerStandardUser(data: UserRegistrationData) {
    const { email, nombre, passwordRaw, telefono } = data;

    const response = await apiClient.post<BackendAuthResponse>('/auth/register', {
        email,
        name: nombre,
        password: passwordRaw,
        phone: telefono ?? null,
    });

    return {
        id: response.user.id,
        email: response.user.email,
        nombre: response.user.name,
        telefono: response.user.phone ?? null,
    };
}

/**
 * Verifica si un usuario existe y lo retorna, o crea uno nuevo con password generado automáticamente.
 */
export async function verificarOCrearUsuarioInvitado(data: {
    nombre: string;
    email: string;
    telefono?: string | null;
}): Promise<GuestUserCreationResult> {
    const { nombre, email, telefono } = data;

    const password = generarPasswordSeguro();

    try {
        const nuevoUsuario = await registerStandardUser({
            email,
            nombre,
            passwordRaw: password,
            telefono,
        });

        return {
            usuario: {
                id: nuevoUsuario.id,
                nombre: nuevoUsuario.nombre,
                email: nuevoUsuario.email,
                telefono: nuevoUsuario.telefono,
            },
            passwordGenerado: password,
            usuarioExistia: false,
        };
    } catch (error) {
        if (error instanceof ApiError && error.status === 409) {
            throw new Error('USUARIO_YA_EXISTE');
        }
        throw error;
    }
}

/**
 * Envía email con credenciales a un proveedor.
 */
export async function enviarCredencialesProveedor(data: {
    email: string;
    nombre: string;
    password: string;
}): Promise<boolean> {
    try {
        const resultado = await enviarEmailCredencialesProveedor(data);
        return resultado.success;
    } catch (error) {
        console.error('Error al enviar email a proveedor:', error);
        return false;
    }
}

/**
 * Envía email con credenciales a un usuario invitado.
 */
export async function enviarCredencialesInvitado(data: {
    email: string;
    nombre: string;
    password: string;
    servicioTitulo?: string;
}): Promise<boolean> {
    try {
        const resultado = await enviarEmailCredencialesInvitado(data);
        return resultado.success;
    } catch (error) {
        console.error('Error al enviar email a invitado:', error);
        return false;
    }
}
