import type { Metadata } from 'next';

import PublicarPageContent from '@/app/(public)/publicar/page';

export const metadata: Metadata = {
    title: 'Publicar Servicio',
    description:
        'Publica tu servicio profesional y llega a miles de clientes potenciales en tu zona. Gratis para empezar.',
    robots: { index: true, follow: true },
};

export default PublicarPageContent;
