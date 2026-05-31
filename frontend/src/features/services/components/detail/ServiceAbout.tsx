import type { ReactElement } from 'react';

import type { Dictionary } from '@/lib/i18n/types';

interface ServiceAboutProps {
    dict: Dictionary;
    professionalName: string;
    description: string;
}

export function ServiceAbout({
    dict,
    professionalName,
    description,
}: ServiceAboutProps): ReactElement {
    return (
        // biome-ignore lint/correctness/useUniqueElementIds: anchor para tabs nav
        <section id="about">
            <h2
                className="m-0 mb-3"
                style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: 'var(--ink)',
                    letterSpacing: '-0.01em',
                }}
            >
                {dict.serviceDetail.aboutTitle} {professionalName}
            </h2>
            <p
                className="m-0 whitespace-pre-wrap text-[15px]"
                style={{ color: 'var(--ink)', lineHeight: 1.65 }}
            >
                {description}
            </p>
        </section>
    );
}
