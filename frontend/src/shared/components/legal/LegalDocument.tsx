import type { ReactElement, ReactNode } from 'react';

import { Mono } from '@/shared/components/hireeo';

interface LegalSection {
    title: string;
    content?: string;
    intro?: string;
    items?: string[];
}

interface LegalDocumentProps {
    eyebrow: string;
    title: string;
    lastUpdated: string;
    sections: LegalSection[];
    footer: string;
    renderSectionBody?: (section: LegalSection) => ReactNode;
}

function DefaultBody({ section }: { section: LegalSection }): ReactElement {
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
            {section.items ? (
                <ul
                    className="m-0 list-disc space-y-2 pl-5 text-[14.5px]"
                    style={{ color: 'var(--sub)', lineHeight: 1.7 }}
                >
                    {section.items.map((item) => (
                        <li key={item}>{item}</li>
                    ))}
                </ul>
            ) : section.content ? (
                <p
                    className="m-0 text-[14.5px]"
                    style={{ color: 'var(--sub)', lineHeight: 1.7 }}
                >
                    {section.content}
                </p>
            ) : null}
        </>
    );
}

export function LegalDocument({
    eyebrow,
    title,
    lastUpdated,
    sections,
    footer,
    renderSectionBody,
}: LegalDocumentProps): ReactElement {
    return (
        <section
            className="mx-auto px-6 py-20 sm:px-10 lg:px-14"
            style={{ maxWidth: 880 }}
        >
            <header className="mb-12">
                <Mono
                    className="text-[11px] font-semibold"
                    style={{ color: 'var(--accent)', letterSpacing: '0.15em' }}
                >
                    — {eyebrow.toUpperCase()}
                </Mono>
                <h1
                    className="m-0 mt-4"
                    style={{
                        fontSize: 'clamp(32px, 4vw, 44px)',
                        fontWeight: 500,
                        letterSpacing: '-0.025em',
                        lineHeight: 1.1,
                        color: 'var(--ink)',
                    }}
                >
                    {title}
                </h1>
                <Mono
                    className="mt-4 inline-block text-[11.5px]"
                    style={{ color: 'var(--muted)', letterSpacing: '0.08em' }}
                >
                    {lastUpdated.toUpperCase()}
                </Mono>
            </header>

            <div className="space-y-10">
                {sections.map((section) => (
                    <article
                        key={section.title}
                        className="border-t pt-8"
                        style={{ borderColor: 'var(--line)' }}
                    >
                        <h2
                            className="m-0 mb-4"
                            style={{
                                fontSize: 20,
                                fontWeight: 600,
                                letterSpacing: '-0.015em',
                                color: 'var(--ink)',
                            }}
                        >
                            {section.title}
                        </h2>
                        {renderSectionBody ? (
                            renderSectionBody(section)
                        ) : (
                            <DefaultBody section={section} />
                        )}
                    </article>
                ))}
            </div>

            <div
                className="mt-12 rounded-xl border p-6 text-center"
                style={{
                    borderColor: 'var(--line)',
                    background: 'var(--tint)',
                }}
            >
                <p
                    className="m-0 text-[14px] font-medium"
                    style={{ color: 'var(--sub)' }}
                >
                    {footer}
                </p>
            </div>
        </section>
    );
}
