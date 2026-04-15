'use server';

import { revalidatePath } from 'next/cache';

import { ApiError, apiClient } from '@/lib/api/apiClient';
import { getAuthToken } from '@/shared/lib/auth/getAuthToken';

import { reviewCreateSchema, reviewUpdateSchema } from '../schemas/reviewSchemas';
import type { ReviewCreateInput, ReviewUpdateInput } from '../types/reviewTypes';

export async function crearCalificacion(data: ReviewCreateInput) {
    const token = await getAuthToken();
    const validated = reviewCreateSchema.parse(data);

    try {
        await apiClient.post(
            `/services/${validated.servicioId}/ratings`,
            {
                estrellas: validated.rating,
                comentario: validated.comment,
            },
            { token },
        );

        revalidatePath('/servicio');
        return { success: true, message: '¡Gracias! Tu reseña ha sido enviada para moderación.' };
    } catch (error) {
        if (error instanceof ApiError && error.status === 409) {
            return { error: 'Ya has calificado este servicio anteriormente' };
        }
        if (error instanceof ApiError && error.status === 401) {
            return { error: 'Debes iniciar sesión para calificar un servicio.' };
        }
        console.error('Error al crear calificación:', error);
        return { error: 'Error al guardar la reseña' };
    }
}

export async function actualizarCalificacion(data: ReviewUpdateInput) {
    const token = await getAuthToken();
    if (!token) return { error: 'No autorizado' };

    const validated = reviewUpdateSchema.parse(data);

    try {
        await apiClient.patch(
            `/ratings/${validated.id}`,
            {
                estrellas: validated.estrellas,
                comentario: validated.comentario,
            },
            { token },
        );

        revalidatePath('/admin/calificaciones');
        return { success: true };
    } catch (error) {
        console.error('Error actualizando calificación:', error);
        return { error: 'Error al actualizar la calificación' };
    }
}

export async function eliminarCalificacion(id: string) {
    const token = await getAuthToken();
    if (!token) return { error: 'No autorizado' };

    try {
        await apiClient.delete(`/ratings/${id}`, { token });

        revalidatePath('/admin/calificaciones');
        return { success: true };
    } catch (error) {
        console.error('Error eliminando calificación:', error);
        return { error: 'Error al eliminar la calificación' };
    }
}

export async function responderReview(serviceId: string, ratingId: string, respuesta: string) {
    const token = await getAuthToken();
    if (!token) return { error: 'Debes iniciar sesión para responder.' };

    try {
        await apiClient.patch(
            `/services/${serviceId}/ratings/${ratingId}/reply`,
            { respuesta },
            { token },
        );

        revalidatePath('/servicio');
        return { success: true };
    } catch (error) {
        if (error instanceof ApiError && error.status === 409) {
            return { error: 'Ya se ha respondido a esta reseña.' };
        }
        if (error instanceof ApiError && error.status === 403) {
            return { error: 'Solo el dueño del servicio puede responder reseñas.' };
        }
        console.error('Error respondiendo a reseña:', error);
        return { error: 'Error al publicar la respuesta.' };
    }
}
