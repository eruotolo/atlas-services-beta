import type { ReactElement, ReactNode } from 'react';

import { LegalDocument } from '@/shared/components/legal/LegalDocument';

import { getDictionary } from '@/lib/i18n/getDictionary';

interface TerminosSection {
    title: string;
    content?: string;
    intro?: string;
    items?: string[];
}

function isContactSection(title: string): boolean {
    return title.includes('7.') || title === '7. Applicable law and contact';
}

function splitContactContent(content: string): { label: string; value: string } {
    const colonIndex = content.indexOf(':');
    if (colonIndex === -1) return { label: content, value: '' };
    return {
        label: content.slice(0, colonIndex + 1),
        value: content.slice(colonIndex + 1).trim(),
    };
}

function renderTerminosBody(section: TerminosSection): ReactNode {
    if (section.items) {
        return (
            <>
                {section.intro ? (
                    <p
                        className="m-0 mb-3 text-[14.5px]"
                        style={{ color: 'var(--sub)', lineHeight: 1.7 }}
                    >
                        {section.intro}
                    </p>
                ) : null}
                <ul
                    className="m-0 list-disc space-y-2 pl-5 text-[14.5px]"
                    style={{ color: 'var(--sub)', lineHeight: 1.7 }}
                >
                    {section.items.map((item) => (
                        <li key={item}>{item}</li>
                    ))}
                </ul>
            </>
        );
    }
    if (isContactSection(section.title) && section.content) {
        const { label, value } = splitContactContent(section.content);
        return (
            <p
                className="m-0 text-[14.5px]"
                style={{ color: 'var(--sub)', lineHeight: 1.7 }}
            >
                {label}{' '}
                <span className="font-semibold" style={{ color: 'var(--accent)' }}>
                    {value}
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

export default async function TerminosPage({
    params,
}: {
    params: Promise<{ country: string }>;
}): Promise<ReactElement> {
    const { country } = await params;
    const raw = getDictionary(country).pages.terminos;
    const dict = { ...raw, sections: raw.sections as unknown as TerminosSection[] };

    return (
        <LegalDocument
            eyebrow="Términos y condiciones"
            title={dict.title}
            lastUpdated={dict.lastUpdated}
            sections={dict.sections}
            footer={dict.footer}
            renderSectionBody={renderTerminosBody}
        />
    );
}
