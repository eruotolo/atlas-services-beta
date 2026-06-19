import type React from 'react';

import ContactView from '@/features/contact/components/ContactView';
import { getDictionary } from '@/lib/i18n/getDictionary';

export default async function ContactoPage({
    params,
}: {
    params: Promise<{ country: string }>;
}): Promise<React.ReactElement> {
    const { country } = await params;
    const dict = getDictionary(country).pages.contacto;
    return <ContactView t={dict} />;
}
