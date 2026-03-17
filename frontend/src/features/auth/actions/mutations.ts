'use server';

import { redirect } from 'next/navigation';

import { ApiError, apiClient } from '@/lib/api/apiClient';
import type { BackendAuthResponse } from '@/lib/api/backendTypes';

import { loginSchema, registerSchema } from '../schemas/authSchemas';

export async function loginAction(formData: FormData) {
    const validatedFields = loginSchema.safeParse({
        email: (formData.get('email') as string)?.toLowerCase().trim(),
        password: formData.get('password'),
    });

    if (!validatedFields.success) {
        return {
            error: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { email } = validatedFields.data;

    redirect(`/api/auth/signin?email=${encodeURIComponent(email)}`);
}

// biome-ignore lint/suspicious/noExplicitAny: React Server Action state type
export async function registerAction(_prevState: any, formData: FormData) {
    const validatedFields = registerSchema.safeParse({
        email: (formData.get('email') as string)?.toLowerCase().trim(),
        password: formData.get('password'),
        nombre: formData.get('nombre'),
        telefono: formData.get('telefono'),
    });

    if (!validatedFields.success) {
        return {
            error: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { email, password, nombre, telefono } = validatedFields.data;

    try {
        await apiClient.post<BackendAuthResponse>('/auth/register', {
            email,
            password,
            name: nombre,
            phone: telefono ?? null,
        });
    } catch (error) {
        if (error instanceof ApiError && error.status === 409) {
            return {
                error: { general: ['Este email ya está registrado'] },
            };
        }

        console.error('Error en registro:', error);
        return {
            error: {
                general: [
                    error instanceof Error
                        ? error.message
                        : 'Error al crear la cuenta. Por favor intenta nuevamente.',
                ],
            },
        };
    }

    redirect('/login');
}

export async function logoutAction() {
    redirect('/api/auth/signout');
}
