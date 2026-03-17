'use server';

import { revalidatePath } from 'next/cache';

import { put } from '@vercel/blob';

import { apiClient } from '@/lib/api/apiClient';
import { getAuthToken } from '@/shared/lib/auth/getAuthToken';

import {
    ownServiceSchema,
    ownServiceUpdateSchema,
    passwordUpdateSchema,
    profileUpdateSchema,
    userCreateSchema,
    userUpdateSchema,
} from '../schemas/userSchemas';
import type {
    OwnServiceInput,
    OwnServiceUpdateInput,
    PasswordUpdateInput,
    UserCreateInput,
    UserUpdateInput,
} from '../types/userTypes';

// ─── Admin: CRUD Usuarios ─────────────────────────────────────────────────────

export async function crearUsuario(data: UserCreateInput) {
    const token = await getAuthToken();
    const validated = userCreateSchema.parse(data);

    try {
        // Registrar el usuario con el endpoint de auth
        const result = await apiClient.post(
            '/auth/register',
            {
                nombre: validated.nombre,
                email: validated.email,
                password: validated.password,
                telefono: validated.telefono,
            },
            { token },
        );

        revalidatePath('/admin/usuarios');
        return { success: true, usuario: result };
    } catch (error) {
        console.error('Error al crear usuario:', error);
        return { error: 'Error al crear usuario. El email puede estar en uso.' };
    }
}

export async function actualizarUsuario(data: UserUpdateInput) {
    const token = await getAuthToken();
    const validated = userUpdateSchema.parse(data);

    try {
        await apiClient.patch(
            `/users/${validated.id}`,
            {
                nombre: validated.nombre,
                email: validated.email,
                telefono: validated.telefono,
                ...(validated.password ? { password: validated.password } : {}),
            },
            { token },
        );

        revalidatePath('/admin/usuarios');
        return { success: true };
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        return { error: 'Error al actualizar usuario' };
    }
}

export async function eliminarUsuario(id: string) {
    const token = await getAuthToken();

    try {
        await apiClient.delete(`/users/${id}`, { token });

        revalidatePath('/admin/usuarios');
        return { success: true };
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        return { error: 'Error al eliminar usuario' };
    }
}

// ─── Perfil del Usuario Autenticado ──────────────────────────────────────────

export async function actualizarPerfil(formData: FormData) {
    const token = await getAuthToken();
    if (!token) return { error: 'No has iniciado sesión' };

    const nombre = formData.get('nombre') as string;
    const telefono = formData.get('telefono') as string;
    const avatarFile = formData.get('avatar') as File | null;
    const userId = formData.get('userId') as string;

    const validated = profileUpdateSchema.parse({ nombre, telefono });

    try {
        let avatarUrl: string | undefined;

        // El upload de avatar se mantiene directo desde el Server Action a Vercel Blob
        if (avatarFile && avatarFile.size > 0) {
            if (avatarFile.size > 2 * 1024 * 1024) {
                return { error: 'La imagen no puede pesar más de 2MB' };
            }
            const { url } = await put(`users/${userId}-${Date.now()}.png`, avatarFile, {
                access: 'public',
                addRandomSuffix: true,
            });
            avatarUrl = url;
        }

        await apiClient.patch(
            `/users/${userId}`,
            {
                nombre: validated.nombre,
                telefono: validated.telefono,
                ...(avatarUrl ? { avatar: avatarUrl } : {}),
            },
            { token },
        );

        revalidatePath('/perfil');
        revalidatePath('/perfil/ajustes');
        return { success: true };
    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        return { error: 'Error al actualizar perfil' };
    }
}

export async function actualizarPassword(data: PasswordUpdateInput) {
    const token = await getAuthToken();
    if (!token) return { error: 'No has iniciado sesión' };

    const validated = passwordUpdateSchema.parse(data);

    try {
        await apiClient.patch(
            '/users/me/password',
            {
                currentPassword: validated.currentPassword,
                newPassword: validated.newPassword,
            },
            { token },
        );

        return { success: true };
    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        return { error: 'Error al cambiar contraseña' };
    }
}

// ─── Servicios Propios del Usuario Autenticado ────────────────────────────────

export async function crearServicioPropio(data: OwnServiceInput) {
    const token = await getAuthToken();
    if (!token) return { error: 'No has iniciado sesión' };

    const validated = ownServiceSchema.parse(data);

    try {
        const result = await apiClient.post(
            '/services',
            {
                titulo: validated.titulo,
                descripcion: validated.descripcion,
                precio: validated.precio,
                comuna: validated.comuna,
                categoriaIds: validated.categoriasIds,
                imagenPrincipal: validated.imagenPrincipal,
                imagenes: validated.imagenes,
                nombreContacto: validated.nombreContacto,
                emailContacto: validated.emailContacto,
                telefonoContacto: validated.telefonoContacto,
                redesSociales: validated.redesSociales,
            },
            { token },
        );

        revalidatePath('/perfil');
        return { success: true, servicio: result };
    } catch (error) {
        console.error('Error al crear servicio:', error);
        return { error: error instanceof Error ? error.message : 'Error al crear servicio' };
    }
}

export async function actualizarServicioPropio(data: OwnServiceUpdateInput) {
    const token = await getAuthToken();
    if (!token) return { error: 'No has iniciado sesión' };

    const validated = ownServiceUpdateSchema.parse(data);

    try {
        const result = await apiClient.patch(
            `/services/${validated.id}`,
            {
                titulo: validated.titulo,
                descripcion: validated.descripcion,
                precio: validated.precio,
                comuna: validated.comuna,
                categoriaIds: validated.categoriasIds,
                imagenPrincipal: validated.imagenPrincipal,
                imagenes: validated.imagenes,
                nombreContacto: validated.nombreContacto,
                emailContacto: validated.emailContacto,
                telefonoContacto: validated.telefonoContacto,
                redesSociales: validated.redesSociales,
            },
            { token },
        );

        revalidatePath('/perfil');
        return { success: true, servicio: result };
    } catch (error) {
        console.error('Error al actualizar servicio:', error);
        return { error: error instanceof Error ? error.message : 'Error al actualizar servicio' };
    }
}

export async function eliminarServicioPropio(id: string) {
    const token = await getAuthToken();
    if (!token) return { error: 'No has iniciado sesión' };

    try {
        await apiClient.delete(`/services/${id}`, { token });

        revalidatePath('/perfil');
        return { success: true };
    } catch (error) {
        console.error('Error al eliminar servicio:', error);
        return { error: 'Error al eliminar servicio' };
    }
}

export async function toggleActivoServicioPropio(id: string) {
    const token = await getAuthToken();
    if (!token) return { error: 'No has iniciado sesión' };

    try {
        await apiClient.patch(`/services/${id}/toggle-owner`, {}, { token });

        revalidatePath('/perfil');
        return { success: true };
    } catch (error) {
        console.error('Error al cambiar estado servicio:', error);
        return { error: 'Error al cambiar estado servicio' };
    }
}
