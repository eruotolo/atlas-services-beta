import { notFound, redirect } from 'next/navigation';

import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';

import { getConversaciones, getMensajes } from '@/features/chat/actions/queries';
import ChatWindow from '@/features/chat/components/ChatWindow';
import { PageHeader } from '@/features/users/components/account/PageHeader';

import { getProfilePageData } from '@/features/users/actions';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Btn, Card } from '@/shared/components/hireeo';

export const metadata: Metadata = {
    title: 'Chat — Hireeo',
    description: 'Conversación con un profesional.',
};

type Props = {
    params: Promise<{ country: string; conversationId: string }>;
};

export default async function ConversationPage({ params }: Props) {
    const { country, conversationId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect(`/${country}/login`);
    }

    const [usuario, conversations] = await Promise.all([
        getProfilePageData(session.user.id),
        getConversaciones(),
    ]);

    if (!usuario) {
        redirect(`/${country}/login`);
    }

    const conversation = conversations.find((c) => c.id === conversationId);
    if (!conversation) {
        notFound();
    }

    const messagesResult = await getMensajes(conversationId);
    const tienePremium = usuario.stats.premiumCount > 0;

    return (
        <>
            <PageHeader
                breadcrumb={['Mi cuenta', 'Mensajes', conversation.otherUser.name]}
                title={`Chat con ${conversation.otherUser.name}`}
                actions={
                    <Btn
                        variant="secondary"
                        icon="arrow"
                        href={`/${country}/profile/mensajes`}
                    >
                        Volver
                    </Btn>
                }
            />

            <div style={{ padding: 28 }}>
                <Card padding={0} style={{ height: 'calc(100vh - 16rem)', overflow: 'hidden' }}>
                    <ChatWindow
                        conversationId={conversationId}
                        initialMessages={messagesResult.data}
                        otherUserName={conversation.otherUser.name}
                    />
                </Card>
            </div>
        </>
    );
}
