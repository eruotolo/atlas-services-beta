'use client';

import Link from 'next/link';

import { MessageSquare } from 'lucide-react';

import { useCountryLink } from '@/features/geo/hooks/useCountryLink';

interface ConversationItem {
    id: string;
    serviceTitle: string;
    serviceImage: string | null;
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
}

interface ConversationListProps {
    conversations: ConversationItem[];
    activeId?: string;
}

export default function ConversationList({ conversations, activeId }: ConversationListProps) {
    const link = useCountryLink();

    if (conversations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <MessageSquare size={48} className="mb-4 text-muted" />
                <h3 className="text-lg font-bold text-sub">
                    Sin mensajes
                </h3>
                <p className="mt-2 max-w-sm text-sm text-muted">
                    Cuando contactes a un profesional, tus conversaciones aparecerán aquí.
                </p>
            </div>
        );
    }

    return (
        <div className="divide-y divide-line">
            {conversations.map((conv) => (
                <Link
                    key={conv.id}
                    href={link(`/perfil/mensajes/${conv.id}`)}
                    className={`flex items-center gap-3 px-4 py-3 transition-colors hover:bg-tint md:px-5 ${
                        activeId === conv.id
                            ? 'bg-brand/5 border-l-2 border-brand'
                            : ''
                    }`}
                >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10 text-sm font-bold text-brand">
                        {conv.otherUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                            <p className="truncate text-sm font-bold text-ink">
                                {conv.otherUser.name}
                            </p>
                            {conv.lastMessage && (
                                <span className="text-[10px] text-muted">
                                    {new Date(conv.lastMessage.date).toLocaleDateString('es-CL', {
                                        day: 'numeric',
                                        month: 'short',
                                    })}
                                </span>
                            )}
                        </div>
                        <p className="truncate text-xs text-muted">
                            {conv.serviceTitle}
                        </p>
                        {conv.lastMessage && (
                            <p
                                className={`mt-0.5 truncate text-xs ${
                                    conv.lastMessage.unread
                                        ? 'font-semibold text-ink'
                                        : 'text-muted'
                                }`}
                            >
                                {conv.lastMessage.text}
                            </p>
                        )}
                    </div>
                    {conv.lastMessage?.unread && (
                        <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-brand" />
                    )}
                </Link>
            ))}
        </div>
    );
}
