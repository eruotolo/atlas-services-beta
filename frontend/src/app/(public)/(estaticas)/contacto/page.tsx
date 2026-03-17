import type { Metadata } from 'next';

import ContactView from './ContactView';

export const metadata: Metadata = {
    title: 'Contacto - Chiloé Servicios',
    description:
        'Contáctanos para resolver tus dudas, sugerencias o consultas sobre Chiloé Servicios. Estamos en Castro, Isla Grande de Chiloé. Soporte por WhatsApp, correo y teléfono.',
    keywords: [
        'contacto Chiloé Servicios',
        'soporte técnico',
        'ayuda plataforma',
        'consultas servicios Chiloé',
        'oficina Castro',
    ],
    openGraph: {
        title: 'Contacto - Chiloé Servicios',
        description: 'Estamos aquí para ayudarte a resolver tus dudas sobre nuestra plataforma.',
        type: 'website',
    },
    alternates: {
        canonical: '/contacto',
    },
};

export default function ContactPage() {
    return <ContactView />;
}
