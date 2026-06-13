import { redirect } from 'next/navigation';

import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';

import { getConversaciones } from '@/features/chat/actions/queries';
import ConversationList from '@/features/chat/components/ConversationList';
import { PageHeader } from '@/features/users/components/account/PageHeader';

import { getProfilePageData } from '@/features/users/actions';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Card } from '@/shared/components/hireeo';

export const metadata: Metadata = {
    title: 'Mis Mensajes — Hireeo',
    description: 'Tus conversaciones con profesionales.',
};

type Props = { params: Promise<{ country: string }> };

export default async function MensajesPage({ params }: Props) {
    const { country } = await params;
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

    const tienePremium = usuario.stats.premiumCount > 0;

    return (
        <>
            <PageHeader
                breadcrumb={['Mi cuenta', 'Mensajes']}
                title="Bandeja de entrada"
                subtitle={
                    conversations.length === 0
                        ? 'Aún no tienes conversaciones.'
                        : `${conversations.length} ${conversations.length === 1 ? 'conversación' : 'conversaciones'} con profesionales.`
                }
            />

            <div style={{ padding: 28 }}>
                <Card padding={0}>
                    <ConversationList conversations={conversations} />
                </Card>
            </div>
        </>
    );
}
