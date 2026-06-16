import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { ChatBubble } from '@/features/messages/components/ChatBubble';
import { ChatInput } from '@/features/messages/components/ChatInput';
import { ChatHeader } from '@/features/messages/components/ChatHeader';
import { TypingIndicator } from '@/features/messages/components/TypingIndicator';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useSocket } from '@/features/messages/context/SocketContext';
import { getMessages } from '@/features/messages/actions/queries';
import { markAsRead } from '@/features/messages/actions/mutations';
import type { Message } from '@/features/messages/types';

const TYPING_TIMEOUT_MS = 3000;

export default function ChatScreen(): React.JSX.Element {
    const { id } = useLocalSearchParams<{ id: string }>();
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    const { socket, connect } = useSocket();
    const queryClient = useQueryClient();

    const [messages, setMessages] = useState<Message[]>([]);
    const [isOtherTyping, setIsOtherTyping] = useState(false);
    const [providerName, setProviderName] = useState('');
    const [providerAvatar, setProviderAvatar] = useState<string | null>(null);
    const [isOtherOnline, setIsOtherOnline] = useState(false);

    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const typingEmitRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const listRef = useRef<FlatList<Message>>(null);

    const { data: history = [] } = useQuery({
        queryKey: ['messages', id],
        queryFn: () => getMessages(id),
        enabled: !!id,
    });

    useEffect(() => {
        if (history.length > 0) setMessages([...history]);
    }, [history]);

    useEffect(() => {
        connect();
    }, [connect]);

    useEffect(() => {
        if (!socket || !id) return;

        socket.emit('join_conversation', { conversationId: id });
        void markAsRead(id).catch(() => { /* ignore error */ });

        const handleNewMessage = (msg: Message): void => {
            setMessages((prev) => [...prev, msg]);
            void markAsRead(id).catch(() => { /* ignore error */ });
            void queryClient.invalidateQueries({ queryKey: ['conversations'] });
            void queryClient.invalidateQueries({ queryKey: ['unread-count'] });
        };

        const handleUserTyping = (data: { userId: string; isTyping: boolean }): void => {
            if (data.userId === user?.id) return;
            setIsOtherTyping(data.isTyping);
            if (data.isTyping) {
                if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = setTimeout(() => setIsOtherTyping(false), TYPING_TIMEOUT_MS);
            }
        };

        const handleUserPresence = (data: { userId: string; isOnline: boolean }): void => {
            if (data.userId !== user?.id) setIsOtherOnline(data.isOnline);
        };

        const handleConversationMeta = (data: {
            providerName: string;
            providerAvatarUrl: string | null;
            isOnline: boolean;
        }): void => {
            setProviderName(data.providerName);
            setProviderAvatar(data.providerAvatarUrl);
            setIsOtherOnline(data.isOnline);
        };

        socket.on('new_message', handleNewMessage);
        socket.on('user_typing', handleUserTyping);
        socket.on('user_presence', handleUserPresence);
        socket.on('conversation_meta', handleConversationMeta);

        return () => {
            socket.emit('leave_conversation', { conversationId: id });
            socket.off('new_message', handleNewMessage);
            socket.off('user_typing', handleUserTyping);
            socket.off('user_presence', handleUserPresence);
            socket.off('conversation_meta', handleConversationMeta);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            if (typingEmitRef.current) clearTimeout(typingEmitRef.current);
        };
    }, [socket, id, user?.id, queryClient]);

    const handleSend = useCallback((content: string): void => {
        if (!socket) return;
        socket.emit('send_message', { conversationId: id, content });
    }, [socket, id]);

    const handleTyping = useCallback((): void => {
        if (!socket) return;
        if (typingEmitRef.current) clearTimeout(typingEmitRef.current);
        socket.emit('typing', { conversationId: id, isTyping: true });
        typingEmitRef.current = setTimeout(() => {
            socket.emit('typing', { conversationId: id, isTyping: false });
        }, 2000);
    }, [socket, id]);

    return (
        <KeyboardAvoidingView
            className="flex-1 bg-surfaceContainerLowest"
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={insets.bottom}
        >
            <View style={{ paddingTop: insets.top }}>
                <ChatHeader
                    name={providerName || '...'}
                    avatarUrl={providerAvatar}
                    isOnline={isOtherOnline}
                    isTyping={isOtherTyping}
                />
            </View>

            <FlatList
                ref={listRef}
                data={[...messages].reverse()}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <ChatBubble message={item} isOwn={item.senderId === user?.id} />
                )}
                contentContainerStyle={{ paddingVertical: 12 }}
                inverted
                ListHeaderComponent={
                    isOtherTyping ? (
                        <View className="px-4 py-2">
                            <TypingIndicator />
                        </View>
                    ) : null
                }
            />

            <View style={{ paddingBottom: insets.bottom }}>
                <ChatInput onSend={handleSend} onTyping={handleTyping} />
            </View>
        </KeyboardAvoidingView>
    );
}
