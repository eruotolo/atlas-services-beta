import { redirect } from 'next/navigation';

import type { Metadata } from 'next';

import { PageHeader } from '@/features/users/components/account/PageHeader';

import { getProfilePageData, getUserProfile } from '@/features/users/actions';
import AjustesPerfilForm from '@/features/users/components/profile/AjustesPerfilForm';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Ajustes de Perfil',
    robots: { index: false, follow: false },
};

type Props = { params: Promise<{ country: string }> };

export default async function AjustesPerfilPage({ params }: Props) {
    const { country } = await params;
    const backendUser = await getUserProfile();

    if (!backendUser) {
        redirect(`/${country}/login`);
    }

    const profile = await getProfilePageData(backendUser.id);
    const tienePremium = (profile?.stats.premiumCount ?? 0) > 0;

    const usuarioData = {
        id: backendUser.id,
        nombre: backendUser.name,
        email: backendUser.email,
        telefono: backendUser.phone ?? null,
        avatar: backendUser.avatar ?? null,
    };

    return (
        <>
            <PageHeader
                breadcrumb={['Mi cuenta', 'Ajustes']}
                title="Ajustes de perfil"
                subtitle="Actualiza tu información personal y contacto."
            />

            <div style={{ padding: 28 }}>
                <AjustesPerfilForm usuario={usuarioData} />
            </div>
        </>
    );
}
