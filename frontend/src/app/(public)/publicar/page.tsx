import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';

import PublicarWizard from '@/features/services/publish/components/PublicarWizard';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const metadata: Metadata = {
    title: 'Publicar Servicio',
    description:
        'Publica tu servicio profesional y llega a miles de clientes potenciales en tu zona. Gratis para empezar.',
    robots: {
        index: true,
        follow: true,
    },
    alternates: {
        canonical: '/publicar',
    },
};

export default async function PublicarPage() {
    const session = await getServerSession(authOptions);

    // Si el usuario está logueado, pasar sus datos al wizard
    const usuarioLogueado = session?.user
        ? {
              id: session.user.id,
              nombre: session.user.name || '',
              email: session.user.email || '',
              telefono: session.user.telefono,
          }
        : null;

    return <PublicarWizard usuarioLogueado={usuarioLogueado} />;
}
