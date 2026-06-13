'use client';

import { type ReactElement, useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Btn, Icon, Avatar } from '@/shared/components/hireeo';

import { chatWidgetBus } from '@/shared/lib/chatWidgetBus';
import { useChatSocket } from '@/features/chat/hooks/useChatSocket';
import { getConversaciones, getMensajes } from '@/features/chat/actions/queries';
import { marcarComoLeido } from '@/features/chat/actions/mutations';

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */
type Conversation = any; // Lo ideal sería exportar ConversationItem de queries
type Message = any;      // Lo ideal sería exportar MessageItem de queries

/* ------------------------------------------------------------------ */
/*  Componente Principal                                              */
/* ------------------------------------------------------------------ */

export function FloatingChatWidget(): ReactElement | null {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session } = useSession();
    
    // States
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState<'list' | 'chat'>('list');
    const [activeChat, setActiveChat] = useState<string | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    
    // Hooks
    const scrollRef = useRef<HTMLDivElement>(null);
    const token = (session as any)?.user?.token || (session as any)?.token || null; 
    const { socket } = useChatSocket(token);

    // Event listeners para abrir/cerrar widget
    useEffect(() => {
        const handleOpen = (chatId?: string) => {
            setIsOpen(true);
            if (chatId) {
                setActiveChat(chatId);
                setView('chat');
            } else {
                setView('list');
            }
        };

        const handleClose = () => setIsOpen(false);

        chatWidgetBus.on('open_chat', handleOpen);
        chatWidgetBus.on('close_chat', handleClose);

        return () => {
            chatWidgetBus.off('open_chat', handleOpen);
            chatWidgetBus.off('close_chat', handleClose);
        };
    }, []);

    // Escuchar mensajes entrantes de WebSockets
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (message: any) => {
            // Si el mensaje es para la conversación activa, lo añadimos
            if (activeChat && message.conversationId === activeChat) {
                setMessages((prev) => [...prev, message]);
                marcarComoLeido(activeChat); // Opcional, marcar como leido apenas llega si estoy viéndolo
            } else {
                // Si no es la activa, recargar la lista de conversaciones para actualizar el badge/ultimo mensaje
                getConversaciones().then(setConversations);
            }
        };

        const handleUnreadUpdate = () => {
            getConversaciones().then(setConversations);
        };

        socket.on('new_message', handleNewMessage);
        socket.on('unread_update', handleUnreadUpdate);

        return () => {
            socket.off('new_message', handleNewMessage);
            socket.off('unread_update', handleUnreadUpdate);
        };
    }, [socket, activeChat]);

    // Cargar conversaciones al abrir
    useEffect(() => {
        if (isOpen && view === 'list') {
            getConversaciones().then(setConversations);
        }
    }, [isOpen, view]);

    // Cargar mensajes cuando entramos a un chat
    useEffect(() => {
        if (view === 'chat' && activeChat) {
            getMensajes(activeChat, 1).then((res) => {
                setMessages(res.data.reverse()); // Asumiendo que vienen los más recientes primero
            });
            marcarComoLeido(activeChat);
            if (socket) socket.emit('join_conversation', { conversationId: activeChat });
        }
        
        return () => {
            if (view === 'chat' && activeChat && socket) {
                socket.emit('leave_conversation', { conversationId: activeChat });
            }
        }
    }, [view, activeChat, socket]);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, view]);

    // Enviar mensaje
    const handleSend = () => {
        if (!inputText.trim() || !activeChat) return;
        
        // Optimistic UI
        const newMsg = {
            id: Date.now().toString(),
            text: inputText,
            senderId: session?.user?.id,
            createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, newMsg]);
        setInputText('');
        
        // Enviar por socket (o server action)
        if (socket) {
            socket.emit('send_message', { conversationId: activeChat, text: newMsg.text });
        }
    };

    // Si estamos en /profile/messages ocultamos el widget
    if (pathname?.includes('/messages')) {
        return null;
    }

    if (!isOpen) {
        return (
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                aria-label="Abrir mensajes"
                className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gray-900 shadow-xl ring-4 ring-white transition-transform hover:scale-105 hover:bg-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
                <div className="relative">
                    <Icon name="chat" size={24} className="text-white" />
                    {/* Placeholder para badge de no leídos global */}
                </div>
            </button>
        );
    }

    const currentChatData = conversations.find(c => c.id === activeChat);

    return (
        <div className="fixed bottom-6 right-6 z-50 flex h-[550px] w-[340px] max-h-[80vh] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-gray-200">
            {view === 'list' ? (
                // --- CHAT LIST ---
                <div className="flex h-full flex-col bg-white">
                    <div className="flex items-center justify-between border-b border-gray-100 p-4">
                        <span className="text-[15px] font-semibold text-gray-800">Mensajes</span>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                            <Icon name="x" size={18} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2">
                        {conversations.length === 0 ? (
                            <div className="flex h-full items-center justify-center text-[13px] text-gray-400">
                                No hay conversaciones aún.
                            </div>
                        ) : null}
                        {conversations.map(chat => (
                            <button
                                key={chat.id}
                                type="button"
                                onClick={() => { setActiveChat(chat.id); setView('chat'); }}
                                className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-gray-50"
                            >
                                <Avatar name={chat.otherUser.name} src={chat.otherUser.avatar} size="md" />
                                <div className="flex-1 overflow-hidden">
                                    <div className="flex items-center justify-between">
                                        <span className={`truncate text-[14px] ${chat.lastMessage?.unread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                                            {chat.otherUser.name}
                                        </span>
                                        <span className="text-[11px] text-gray-400">
                                            {chat.lastMessageAt ? new Date(chat.lastMessageAt).toLocaleDateString() : ''}
                                        </span>
                                    </div>
                                    <span className={`block truncate text-[12px] ${chat.lastMessage?.unread ? 'font-medium text-blue-600' : 'text-gray-500'}`}>
                                        {chat.lastMessage?.text || 'No hay mensajes'}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                // --- CHAT WINDOW ---
                <div className="flex h-full flex-col bg-gray-50">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-200 bg-white p-3 shadow-sm">
                        <div className="flex items-center gap-3">
                            <button onClick={() => { setView('list'); setActiveChat(null); }} className="text-gray-500 hover:text-gray-700">
                                <Icon name="chevron-left" size={20} />
                            </button>
                            <div className="flex items-center gap-2">
                                <Avatar name={currentChatData?.otherUser.name || 'Usuario'} src={currentChatData?.otherUser.avatar} size="sm" />
                                <div className="flex flex-col">
                                    <span className="text-[13px] font-semibold text-gray-900 leading-tight">{currentChatData?.otherUser.name}</span>
                                    <span className="text-[11px] text-gray-500 leading-tight truncate w-[180px]">{currentChatData?.serviceTitle}</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                            <Icon name="x" size={18} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                        {messages.map(msg => {
                            const isMe = msg.senderId === session?.user?.id;
                            return (
                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-[13px] ${isMe ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white border border-gray-100 text-gray-800 shadow-sm rounded-bl-sm'}`}>
                                        {msg.text}
                                        <span className={`block text-[9px] mt-1 text-right ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Input Area */}
                    <div className="bg-white p-3 border-t border-gray-100">
                        <form 
                            onSubmit={(e) => { e.preventDefault(); handleSend(); }} 
                            className="flex items-center gap-2 bg-gray-50 rounded-full pr-1 pl-3 py-1 ring-1 ring-gray-200 focus-within:ring-blue-500"
                        >
                            <input 
                                type="text" 
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Escribe un mensaje..." 
                                className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-gray-400"
                            />
                            <button type="submit" disabled={!inputText.trim()} className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50">
                                <Icon name="arrow-up" size={16} />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
