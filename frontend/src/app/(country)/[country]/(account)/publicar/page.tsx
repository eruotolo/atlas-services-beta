import { redirect } from 'next/navigation';

import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';

import PublicarWizard from '@/features/services/publish/components/PublicarWizard';
import { PageHeader } from '@/features/users/components/account/PageHeader';
import { UserShell } from '@/features/users/components/account/UserShell';
import { getProfilePageData } from '@/features/users/actions';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const metadata: Metadata = {
    title: 'Publicar Servicio',
    description:
        'Publica tu servicio profesional y llega a miles de clientes potenciales en tu zona. Gratis para empezar.',
    robots: { index: true, follow: true },
    alternates: { canonical: '/publicar' },
};

type Props = { params: Promise<{ country: string }> };

export default async function PublicarPage({ params }: Props) {
    const { country } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect(`/${country}/login?callbackUrl=/${country}/publicar`);
    }

    const usuarioLogueado = {
        id: session.user.id,
        nombre: session.user.name || '',
        email: session.user.email || '',
        telefono: session.user.telefono,
    };

    const profile = await getProfilePageData(session.user.id);
    const tienePremium = (profile?.stats.premiumCount ?? 0) > 0;

    return (
        <UserShell
            country={country}
            user={{
                name: session.user.name || '',
                avatar: profile?.avatar,
                isPremium: tienePremium,
            }}
        >
            <PageHeader
                breadcrumb={['Mi cuenta', 'Publicar servicio']}
                title="Nuevo servicio"
                subtitle="Completa los pasos para publicar y empezar a recibir contactos."
            />

            <div style={{ padding: 28 }}>
                <PublicarWizard usuarioLogueado={usuarioLogueado} />
            </div>
        </UserShell>
    );
}
