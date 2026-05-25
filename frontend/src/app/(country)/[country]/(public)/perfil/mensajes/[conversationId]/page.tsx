import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

import { getConversaciones, getMensajes } from '@/features/chat/actions/queries';
import ChatWindow from '@/features/chat/components/ChatWindow';

export const metadata: Metadata = {
    title: 'Chat — Atlas Services',
    description: 'Conversación con un profesional.',
};

export default async function ConversationPage({
    params,
}: {
    params: Promise<{ country: string; conversationId: string }>;
}) {
    const { country, conversationId } = await params;

    // Obtener conversaciones para mostrar la info del otro usuario
    const conversations = await getConversaciones();
    const conversation = conversations.find((c) => c.id === conversationId);

    if (!conversation) {
        notFound();
    }

    // Obtener mensajes iniciales
    const messagesResult = await getMensajes(conversationId);

    return (
        <section className="bg-background min-h-screen">
            <div className="container mx-auto max-w-3xl">
                {/* Mobile back button */}
                <div className="border-b border-gray-100 px-4 py-3 md:hidden dark:border-white/5">
                    <Link
                        href={`/${country}/perfil/mensajes`}
                        className="flex items-center gap-2 text-sm font-medium text-brand dark:text-brand-light"
                    >
                        <ArrowLeft size={16} />
                        Volver a mensajes
                    </Link>
                </div>

                <div className="h-[calc(100vh-8rem)] overflow-hidden rounded-2xl border border-gray-100 bg-white md:my-8 dark:border-white/10 dark:bg-gray-900/40">
                    <ChatWindow
                        conversationId={conversationId}
                        initialMessages={messagesResult.data}
                        otherUserName={conversation.otherUser.name}
                    />
                </div>
            </div>
        </section>
    );
}
