export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';

import AjustesPerfilPageContent from '@/app/(public)/perfil/ajustes/page';

export const metadata: Metadata = {
    title: 'Ajustes de Perfil',
    robots: { index: false, follow: false },
};

export default AjustesPerfilPageContent;
