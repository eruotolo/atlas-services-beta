'use server';

import { revalidatePath } from 'next/cache';

import { apiClient } from '@/lib/api/apiClient';
import { getAuthToken } from '@/shared/lib/auth/getAuthToken';

import { categorySchema, categoryUpdateSchema } from '../schemas/categorySchemas';
import type { CategoryInput, CategoryUpdateInput } from '../types/categoryTypes';

export async function crearCategoria(data: CategoryInput) {
    const token = await getAuthToken();
    const validated = categorySchema.parse(data);

    try {
        const categoria = await apiClient.post(
            '/categories',
            {
                nombre: validated.nombre,
                slug: validated.nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
                icono: validated.icono,
                orden: validated.orden,
                activo: validated.activo,
            },
            { token },
        );

        revalidatePath('/admin/categorias');
        return { success: true, categoria };
    } catch (error) {
        console.error('Error al crear categoría:', error);
        return { error: 'Error al crear categoría' };
    }
}

export async function actualizarCategoria(data: CategoryUpdateInput) {
    const token = await getAuthToken();
    const validated = categoryUpdateSchema.parse(data);

    try {
        const categoria = await apiClient.patch(
            `/categories/${validated.id}`,
            {
                nombre: validated.nombre,
                slug: validated.nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
                icono: validated.icono,
                orden: validated.orden,
                activo: validated.activo,
            },
            { token },
        );

        revalidatePath('/admin/categorias');
        return { success: true, categoria };
    } catch (error) {
        console.error('Error al actualizar categoría:', error);
        return { error: 'Error al actualizar categoría' };
    }
}

export async function eliminarCategoria(id: string) {
    const token = await getAuthToken();

    try {
        await apiClient.delete(`/categories/${id}`, { token });

        revalidatePath('/admin/categorias');
        return { success: true };
    } catch (error) {
        // El backend retorna 400/409 si hay servicios asociados
        console.error('Error al eliminar categoría:', error);
        return { error: 'Error al eliminar categoría (puede tener servicios asociados)' };
    }
}

export async function toggleActivoCategoria(id: string) {
    const token = await getAuthToken();

    try {
        // Obtenemos el estado actual y enviamos el toggle
        await apiClient.patch(`/categories/${id}`, { activo: null }, { token });

        revalidatePath('/admin/categorias');
        return { success: true };
    } catch (error) {
        console.error('Error al cambiar estado de categoría:', error);
        return { error: 'Error al cambiar estado de categoría' };
    }
}
