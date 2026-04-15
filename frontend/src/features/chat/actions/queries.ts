'use server';

import { cache } from 'react';

import { apiClient } from '@/lib/api/apiClient';
import { getAuthToken } from '@/shared/lib/auth/getAuthToken';

interface ConversationItem {
    id: string;
    serviceId: string;
    serviceTitle: string;
    serviceImage: string | null;
    serviceSlug: string;
    otherUser: {
        id: string;
        name: string;
        avatar: string | null;
    };
    lastMessage: {
        text: string;
        date: string;
        unread: boolean;
    } | null;
    lastMessageAt: string;
}

interface MessageItem {
    id: string;
    senderId: string;
    senderType: 'CLIENT' | 'PROVIDER';
    text: string;
    read: boolean;
    createdAt: string;
}

interface PaginatedMessages {
    data: MessageItem[];
    meta: { total: number; page: number; limit: number; totalPages: number };
}

export const getConversaciones = cache(async () => {
    try {
        const token = await getAuthToken();
        if (!token) return [];

        return apiClient.get<ConversationItem[]>('/chat/conversations', {
            token,
            revalidate: 0,
        });
    } catch (error) {
        console.error('Error obteniendo conversaciones:', error);
        return [];
    }
});

export const getMensajes = cache(async (conversationId: string, page = 1) => {
    try {
        const token = await getAuthToken();
        if (!token) return { data: [], meta: { total: 0, page: 1, limit: 50, totalPages: 0 } };

        return apiClient.get<PaginatedMessages>(
            `/chat/conversations/${conversationId}/messages?page=${page}`,
            { token, revalidate: 0 },
        );
    } catch (error) {
        console.error('Error obteniendo mensajes:', error);
        return { data: [], meta: { total: 0, page: 1, limit: 50, totalPages: 0 } };
    }
});

export const getUnreadCount = cache(async () => {
    try {
        const token = await getAuthToken();
        if (!token) return 0;

        const result = await apiClient.get<{ count: number }>('/chat/unread-count', {
            token,
            revalidate: 0,
        });

        return result.count;
    } catch {
        return 0;
    }
});
