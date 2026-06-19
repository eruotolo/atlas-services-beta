import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import type { Metadata } from 'next';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import MyAddresses from '@/features/users/components/profile/MyAddresses';
import { PageHeader } from '@/shared/components/hireeo';

export const metadata: Metadata = {
    title: 'Mis Direcciones',
};

export default async function AddressesPage({
    params,
}: {
    params: Promise<{ country: string }>;
}) {
    const { country } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect(`/${country}/login`);
    }

    return (
        <>
            <PageHeader 
                breadcrumb={['Mi cuenta', 'Direcciones']}
                title="Direcciones" 
                subtitle="Administra los lugares donde recibes servicios" 
            />
            <div style={{ padding: 28 }}>
                <MyAddresses userId={session.user.id} />
            </div>
        </>
    );
}
