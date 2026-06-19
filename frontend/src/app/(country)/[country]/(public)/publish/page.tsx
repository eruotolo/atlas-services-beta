import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';

import PublicarWizard from '@/features/services/publish/components/PublicarWizard';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const metadata: Metadata = {
    title: 'Publicar Servicio',
    description:
        'Publica tu servicio profesional y llega a miles de clientes potenciales en tu zona. Gratis para empezar.',
    robots: { index: true, follow: true },
    alternates: { canonical: '/publish' },
};

type Props = { params: Promise<{ country: string }> };

export default async function PublicarPage({ params }: Props) {
    const { country } = await params;
    const session = await getServerSession(authOptions);

    let usuarioLogueado = null;
    if (session?.user) {
        usuarioLogueado = {
            id: session.user.id,
            nombre: session.user.name || '',
            email: session.user.email || '',
            phone: (session.user as any).phone,
        };
    }

    return (
        <div className="mx-auto max-w-site px-4 py-12 sm:px-6 lg:px-8">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                    Publicar nuevo servicio
                </h1>
                <p className="mt-2 text-sm text-gray-500">
                    Completa los pasos para publicar y empezar a recibir contactos.
                </p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-10">
                <PublicarWizard usuarioLogueado={usuarioLogueado} />
            </div>
        </div>
    );
}
