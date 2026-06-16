import { apiClient } from '@/shared/lib/apiClient';
import type { Conversation, Message, UnreadCountResponse } from '@/features/messages/types';

export async function getConversations(): Promise<readonly Conversation[]> {
    return apiClient.get<readonly Conversation[]>('/chat/conversations');
}

export async function getMessages(conversationId: string, page = 1): Promise<readonly Message[]> {
    return apiClient.get<readonly Message[]>(`/chat/conversations/${conversationId}/messages?page=${page}&limit=50`);
}

export async function getUnreadCount(): Promise<number> {
    const res = await apiClient.get<UnreadCountResponse>('/chat/unread-count');
    return res.count;
}
