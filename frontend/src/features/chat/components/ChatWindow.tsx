'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { Send } from 'lucide-react';
import { useSession } from 'next-auth/react';

import { getSocket, disconnectSocket } from '../lib/socket';
import ChatBubble from './ChatBubble';

interface Message {
    id: string;
    senderId: string;
    senderType: string;
    text: string;
    read: boolean;
    createdAt: string;
}

interface ChatWindowProps {
    conversationId: string;
    initialMessages: Message[];
    otherUserName: string;
}

export default function ChatWindow({
    conversationId,
    initialMessages,
    otherUserName,
}: ChatWindowProps) {
    const { data: session } = useSession();
    const backendToken = (session?.user as { backendToken?: string } | undefined)?.backendToken;
    const currentUserId = (session?.user as { id?: string } | undefined)?.id;

    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [input, setInput] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    useEffect(() => {
        if (!backendToken) return;

        const socket = getSocket(backendToken);

        socket.on('connect', () => {
            setIsConnected(true);
            socket.emit('join_conversation', { conversationId });
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
        });

        socket.on('new_message', (message: Message) => {
            setMessages((prev) => {
                // Evitar duplicados
                if (prev.some((m) => m.id === message.id)) return prev;
                return [...prev, message];
            });
        });

        socket.on('messages_read', ({ readBy }: { readBy: string }) => {
            if (readBy !== currentUserId) {
                setMessages((prev) =>
                    prev.map((m) => (m.senderId === currentUserId ? { ...m, read: true } : m)),
                );
            }
        });

        // Si ya estaba conectado, unirse a la conversación
        if (socket.connected) {
            setIsConnected(true);
            socket.emit('join_conversation', { conversationId });
        }

        return () => {
            socket.emit('leave_conversation', { conversationId });
            socket.off('new_message');
            socket.off('messages_read');
            socket.off('connect');
            socket.off('disconnect');
        };
    }, [backendToken, conversationId, currentUserId]);

    const sendMessage = () => {
        const trimmed = input.trim();
        if (!trimmed || !backendToken) return;

        const socket = getSocket(backendToken);
        socket.emit('send_message', {
            conversationId,
            text: trimmed,
        });

        setInput('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 md:px-6 dark:border-white/5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/10 text-sm font-bold text-brand dark:bg-brand-marino/30 dark:text-brand-light">
                    {otherUserName.charAt(0).toUpperCase()}
                </div>
                <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{otherUserName}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">
                        {isConnected ? '● En línea' : '○ Desconectado'}
                    </p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 md:px-6">
                {messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                        <p className="text-sm text-gray-400 dark:text-gray-500">
                            Envía el primer mensaje a {otherUserName}
                        </p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <ChatBubble
                            key={msg.id}
                            text={msg.text}
                            date={new Date(msg.createdAt)}
                            isOwn={msg.senderId === currentUserId}
                            read={msg.read}
                        />
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-100 px-4 py-3 md:px-6 dark:border-white/5">
                <div className="flex items-end gap-2">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Escribe un mensaje..."
                        rows={1}
                        className="flex-1 resize-none rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none dark:border-white/10 dark:bg-gray-800 dark:text-gray-200 dark:placeholder-gray-500"
                    />
                    <button
                        type="button"
                        onClick={sendMessage}
                        disabled={!input.trim() || !isConnected}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50 dark:bg-brand-light dark:text-gray-900"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
