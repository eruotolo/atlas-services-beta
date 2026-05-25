'use server';

import { apiClient } from '@/lib/api/apiClient';
import { getAuthToken } from '@/shared/lib/auth/getAuthToken';

export async function iniciarConversacion(serviceId: string) {
    const token = await getAuthToken();
    if (!token) return { error: 'Debes iniciar sesión para enviar un mensaje.' };

    try {
        const conversation = await apiClient.post<{ id: string }>(
            '/chat/conversations',
            { serviceId },
            { token },
        );

        return { success: true, conversationId: conversation.id };
    } catch (error) {
        console.error('Error iniciando conversación:', error);
        return { error: 'Error al iniciar la conversación.' };
    }
}

export async function marcarComoLeido(conversationId: string) {
    const token = await getAuthToken();
    if (!token) return;

    try {
        await apiClient.post(`/chat/conversations/${conversationId}/read`, {}, { token });
    } catch (error) {
        console.error('Error marcando como leído:', error);
    }
}
