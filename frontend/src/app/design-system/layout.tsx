import type { Metadata, Viewport } from 'next';
import type { ReactElement, ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Design System · Hireeo 2.0',
    description:
        'Tokens, paleta, tipografía, iconografía y componentes del sistema visual de Hireeo.',
    robots: { index: false, follow: false },
};

export const viewport: Viewport = {
    themeColor: '#FFFFFF',
};

export default function DesignSystemLayout({ children }: { children: ReactNode }): ReactElement {
    return (
        <div className="min-h-screen bg-bg text-ink" style={{ background: 'var(--bg)' }}>
            {children}
        </div>
    );
}
