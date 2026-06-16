export type MessageStatus = 'sent' | 'delivered' | 'seen';

export interface Conversation {
    readonly id: string;
    readonly providerName: string;
    readonly providerAvatarUrl: string | null;
    readonly lastMessage: string;
    readonly timestamp: string;
    readonly unreadCount: number;
    readonly isOnline?: boolean;
    readonly isTyping?: boolean;
    readonly messageStatus?: MessageStatus;
}

export interface ConversationDetail extends Conversation {
    readonly serviceId: string;
    readonly serviceTitle: string;
    readonly participantId: string;
}

export interface Message {
    readonly id: string;
    readonly conversationId: string;
    readonly senderId: string;
    readonly content: string;
    readonly createdAt: string;
    readonly readAt: string | null;
}

export interface UnreadCountResponse {
    readonly count: number;
}
