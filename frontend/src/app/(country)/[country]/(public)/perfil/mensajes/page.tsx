import { MessageSquare } from 'lucide-react';
import type { Metadata } from 'next';

import { getConversaciones } from '@/features/chat/actions/queries';
import ConversationList from '@/features/chat/components/ConversationList';

export const metadata: Metadata = {
    title: 'Mis Mensajes — Atlas Services',
    description: 'Tus conversaciones con profesionales.',
};

export default async function MensajesPage() {
    const conversations = await getConversaciones();

    return (
        <section className="bg-background min-h-screen py-8 md:py-12">
            <div className="container mx-auto max-w-site px-4 sm:px-6 lg:px-8">
                <div className="mb-8 md:mb-10">
                    <h1 className="text-2xl font-black text-gray-900 md:text-3xl dark:text-white">
                        Mis Mensajes
                    </h1>
                    <p className="mt-2 text-sm text-gray-500 md:text-base dark:text-gray-400">
                        Conversaciones con profesionales de servicios.
                    </p>
                </div>

                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-white/10 dark:bg-gray-900/40">
                    <ConversationList conversations={conversations} />
                </div>
            </div>
        </section>
    );
}
