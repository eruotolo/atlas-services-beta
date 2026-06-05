import type { ReactElement, ReactNode } from 'react';

import { LegalDocument } from '@/shared/components/legal/LegalDocument';

import { getPageDictionary } from '@/lib/i18n/getPageDictionary';

interface PrivacidadSection {
    title: string;
    content?: string;
    items?: string[];
}

interface PrivacidadDict {
    title: string;
    lastUpdated: string;
    sections: PrivacidadSection[];
    footer: string;
}

function isContactSection(title: string): boolean {
    return title === 'Contacto' || title === 'Contact';
}

function renderPrivacidadBody(section: PrivacidadSection): ReactNode {
    if (section.items) {
        return (
            <ul
                className="m-0 list-disc space-y-2 pl-5 text-[14.5px]"
                style={{ color: 'var(--sub)', lineHeight: 1.7 }}
            >
                {section.items.map((item) => (
                    <li key={item}>{item}</li>
                ))}
            </ul>
        );
    }
    if (isContactSection(section.title) && section.content) {
        return (
            <p
                className="m-0 text-[14.5px]"
                style={{ color: 'var(--sub)', lineHeight: 1.7 }}
            >
                <span className="font-semibold" style={{ color: 'var(--accent)' }}>
                    {section.content}
                </span>
            </p>
        );
    }
    return (
        <p
            className="m-0 text-[14.5px]"
            style={{ color: 'var(--sub)', lineHeight: 1.7 }}
        >
            {section.content}
        </p>
    );
}

export default async function PrivacidadPage({
    params,
}: {
    params: Promise<{ country: string }>;
}): Promise<ReactElement> {
    const { country } = await params;
    const dict = getPageDictionary<PrivacidadDict>('privacidad', country);

    return (
        <LegalDocument
            eyebrow="Política de privacidad"
            title={dict.title}
            lastUpdated={dict.lastUpdated}
            sections={dict.sections}
            footer={dict.footer}
            renderSectionBody={renderPrivacidadBody}
        />
    );
}
