import { apiClient } from '@/shared/lib/apiClient';

export async function markAsRead(conversationId: string): Promise<void> {
    await apiClient.post(`/chat/conversations/${conversationId}/read`);
}

export async function createConversation(serviceId: string): Promise<{ conversationId: string }> {
    return apiClient.post<{ conversationId: string }>('/chat/conversations', { serviceId });
}
