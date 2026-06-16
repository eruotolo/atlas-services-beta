import { apiClient } from '@/shared/lib/apiClient';

export interface ReviewCreateInput {
    servicioId: string;
    rating: number;
    comment: string;
}

export interface ReviewUpdateInput {
    id: string;
    estrellas: number;
    comentario: string;
}

export async function createReview(data: ReviewCreateInput): Promise<{ success: boolean; error?: string }> {
    try {
        await apiClient.post(`/services/${data.servicioId}/ratings`, {
            estrellas: data.rating,
            comentario: data.comment,
        });
        return { success: true };
    } catch (error: any) {
        if (error.status === 409) return { success: false, error: 'Ya has calificado este servicio anteriormente' };
        if (error.status === 401) return { success: false, error: 'Debes iniciar sesión para calificar un servicio' };
        return { success: false, error: error?.message || 'Error al guardar la reseña' };
    }
}

export async function updateReview(data: ReviewUpdateInput): Promise<{ success: boolean; error?: string }> {
    try {
        await apiClient.patch(`/ratings/${data.id}`, {
            estrellas: data.estrellas,
            comentario: data.comentario,
        });
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error?.message || 'Error al actualizar la calificación' };
    }
}

export async function deleteReview(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        await apiClient.delete(`/ratings/${id}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error?.message || 'Error al eliminar la calificación' };
    }
}

export async function replyReview(serviceId: string, ratingId: string, respuesta: string): Promise<{ success: boolean; error?: string }> {
    try {
        await apiClient.patch(`/services/${serviceId}/ratings/${ratingId}/reply`, { respuesta });
        return { success: true };
    } catch (error: any) {
        if (error.status === 409) return { success: false, error: 'Ya se ha respondido a esta reseña' };
        if (error.status === 403) return { success: false, error: 'Solo el dueño del servicio puede responder reseñas' };
        return { success: false, error: error?.message || 'Error al publicar la respuesta' };
    }
}
