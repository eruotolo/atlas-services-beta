import type React from 'react';

import { getPageDictionary } from '@/lib/i18n/getPageDictionary';
import ContactView from '@/features/contact/components/ContactView';

interface ContactoDict {
    title: string;
    titleHighlight: string;
    subtitle: string;
    email: string;
    whatsapp: string;
    office: string;
    officeValue: string;
    form: {
        name: string;
        namePlaceholder: string;
        email: string;
        emailPlaceholder: string;
        phone: string;
        phonePlaceholder: string;
        subject: string;
        subjectOptions: string[];
        message: string;
        messagePlaceholder: string;
        submit: string;
        sending: string;
        success: string;
        defaultSubject: string;
    };
}

export default async function ContactoPage({
    params,
}: {
    params: Promise<{ country: string }>;
}): Promise<React.ReactElement> {
    const { country } = await params;
    const dict = getPageDictionary<ContactoDict>('contacto', country);
    return <ContactView t={dict} />;
}
