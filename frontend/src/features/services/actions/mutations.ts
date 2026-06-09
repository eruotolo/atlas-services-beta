'use server';

import { revalidatePath } from 'next/cache';

import { apiClient } from '@/lib/api/apiClient';
import { getAuthToken } from '@/shared/lib/auth/getAuthToken';

import { servicioCreateSchema, servicioUpdateSchema } from '../schemas/serviceSchemas';
import type { ServicioCreateInput, ServicioUpdateInput } from '../types/serviceTypes';

export async function crearServicio(data: ServicioCreateInput) {
    const token = await getAuthToken();
    const validated = servicioCreateSchema.parse(data);

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

        revalidatePath('/admin/services');
        return { success: true, servicio: result };
    } catch (error) {
        console.error('Error al crear servicio:', error);
        return { error: 'Error al crear servicio' };
    }
}

export async function actualizarServicio(data: ServicioUpdateInput) {
    const token = await getAuthToken();
    const validated = servicioUpdateSchema.parse(data);

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

        revalidatePath('/admin/services');
        return { success: true, servicio: result };
    } catch (error) {
        console.error('Error al actualizar servicio:', error);
        return { error: 'Error al actualizar servicio' };
    }
}

export async function eliminarServicio(id: string) {
    const token = await getAuthToken();
    if (!id) return { error: 'ID es requerido' };

    try {
        await apiClient.delete(`/services/${id}`, { token });

        revalidatePath('/admin/services');
        return { success: true };
    } catch (error) {
        console.error('Error al eliminar servicio:', error);
        return { error: 'Error al eliminar servicio' };
    }
}

export async function toggleActivoServicio(id: string) {
    const token = await getAuthToken();

    try {
        await apiClient.patch(`/services/${id}/active`, {}, { token });

        revalidatePath('/admin/services');
        return { success: true };
    } catch (error) {
        console.error('Error al cambiar estado del servicio:', error);
        return { error: 'Error al cambiar estado del servicio' };
    }
}

export async function toggleDestacadoServicio(id: string) {
    const token = await getAuthToken();

    try {
        await apiClient.patch(`/services/${id}/featured`, {}, { token });

        revalidatePath('/admin/services');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Error al cambiar destacado del servicio:', error);
        return { error: 'Error al cambiar destacado del servicio' };
    }
}
