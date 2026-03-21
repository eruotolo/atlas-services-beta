import type { Metadata } from 'next';

import LoginPageContent from '@/app/(public)/login/page';

export const metadata: Metadata = {
    title: 'Iniciar Sesión',
    robots: { index: false, follow: false },
};

export default LoginPageContent;
