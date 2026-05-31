import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import { getPageDictionary } from '@/lib/i18n/getPageDictionary';
import { Btn, Icon, Mono, SectionLabel } from '@/shared/components/hireeo';

interface FaqBlock {
    type:
        | 'p'
        | 'p-bold'
        | 'p-bold-green'
        | 'p-bold-blue'
        | 'p-bold-red'
        | 'ol'
        | 'ul'
        | 'ul-grid'
        | 'note';
    text?: string;
    items?: string[];
}

interface FaqItem {
    q: string;
    a: FaqBlock[];
}

interface AyudaDict {
    meta: { title: string; description: string };
    header: { title: string; subtitle: string };
    cta: { title: string; subtitle: string; button: string };
    faqs: FaqItem[];
}

function renderBlock(block: FaqBlock, i: number): ReactElement {
    const key = `${block.type}-${i}`;
    if (block.type === 'ol') {
        return (
            <ol
                key={key}
                className="m-0 list-decimal space-y-1 pl-5 text-[14px]"
                style={{ color: 'var(--sub)' }}
            >
                {(block.items ?? []).map((item) => (
                    <li key={item}>{item}</li>
                ))}
            </ol>
        );
    }
    if (block.type === 'ul' || block.type === 'ul-grid') {
        const gridClass = block.type === 'ul-grid' ? 'grid grid-cols-2 gap-1.5' : 'space-y-1';
        return (
            <ul
                key={key}
                className={`m-0 list-disc pl-5 text-[14px] ${gridClass}`}
                style={{ color: 'var(--sub)' }}
            >
                {(block.items ?? []).map((item) => (
                    <li key={item}>{item}</li>
                ))}
            </ul>
        );
    }
    if (block.type === 'note') {
        return (
            <p
                key={key}
                className="m-0 text-[12.5px] italic"
                style={{ color: 'var(--muted)' }}
            >
                {block.text}
            </p>
        );
    }
    const isStrong = block.type.startsWith('p-bold');
    const color =
        block.type === 'p-bold-green'
            ? 'var(--success)'
            : block.type === 'p-bold-red'
              ? 'var(--danger)'
              : block.type === 'p-bold-blue'
                ? 'var(--accent)'
                : 'var(--sub)';
    return (
        <p
            key={key}
            className="m-0 text-[14px] leading-[1.55]"
            style={{ color, fontWeight: isStrong ? 600 : 400 }}
        >
            {block.text}
        </p>
    );
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ country: string }>;
}): Promise<Metadata> {
    const { country } = await params;
    const dict = getPageDictionary<AyudaDict>('ayuda', country);
    return {
        title: dict.meta.title,
        description: dict.meta.description,
        alternates: { canonical: `/${country}/ayuda` },
    };
}

export default async function AyudaPage({
    params,
}: {
    params: Promise<{ country: string }>;
}): Promise<ReactElement> {
    const { country } = await params;
    const dict = getPageDictionary<AyudaDict>('ayuda', country);

    return (
        <div style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
            <section
                className="border-b text-center"
                style={{ borderColor: 'var(--line)' }}
            >
                <div className="mx-auto max-w-[1100px] px-6 pt-20 pb-12 sm:px-10 lg:px-14">
                    <SectionLabel>— CENTRO DE AYUDA</SectionLabel>
                    <h1
                        className="m-0 mt-3.5 mb-4"
                        style={{
                            fontSize: 'clamp(34px, 5vw, 52px)',
                            fontWeight: 500,
                            letterSpacing: '-0.04em',
                            lineHeight: 1,
                            color: 'var(--ink)',
                        }}
                    >
                        {dict.header.title}
                    </h1>
                    <p
                        className="m-0 mx-auto mb-8 max-w-[540px] text-[16px]"
                        style={{ color: 'var(--sub)' }}
                    >
                        {dict.header.subtitle}
                    </p>

                    <div
                        className="mx-auto flex max-w-[580px] items-center gap-2 rounded-[11px] border bg-bg p-1.5"
                        style={{
                            borderColor: 'var(--line)',
                            boxShadow: '0 8px 24px rgba(10,10,10,0.04)',
                        }}
                    >
                        <div className="flex flex-1 items-center gap-2.5 px-3.5 py-1.5">
                            <Icon name="search" size={16} stroke="var(--sub)" />
                            <input
                                placeholder="Buscar en el centro de ayuda…"
                                className="flex-1 border-none bg-transparent py-1.5 text-[14px] outline-none"
                                style={{ color: 'var(--ink)' }}
                            />
                        </div>
                        <Btn variant="primary">Buscar</Btn>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-[1100px] px-6 py-14 sm:px-10 lg:px-14">
                <div className="mb-6 flex items-end justify-between">
                    <SectionLabel>— ARTÍCULOS</SectionLabel>
                    <Mono className="text-[12.5px]" style={{ color: 'var(--sub)' }}>
                        {dict.faqs.length} resultados
                    </Mono>
                </div>

                <div style={{ borderTop: '1px solid var(--line)' }}>
                    {dict.faqs.map((faq, i) => (
                        <details
                            key={faq.q}
                            className="group"
                            style={{ borderBottom: '1px solid var(--line)' }}
                        >
                            <summary
                                className="grid cursor-pointer list-none items-center gap-4 py-5"
                                style={{ gridTemplateColumns: '32px minmax(0, 1fr) 24px' }}
                            >
                                <Mono
                                    className="text-[13px] font-semibold"
                                    style={{ color: 'var(--sub)' }}
                                >
                                    {String(i + 1).padStart(2, '0')}
                                </Mono>
                                <span
                                    className="text-[15px] font-medium"
                                    style={{ color: 'var(--ink)' }}
                                >
                                    {faq.q}
                                </span>
                                <span
                                    className="inline-flex items-center justify-center transition-transform group-open:rotate-180"
                                    style={{ color: 'var(--muted)' }}
                                >
                                    <Icon name="chevronDown" size={16} />
                                </span>
                            </summary>
                            <div className="grid items-start gap-4 pb-6" style={{ gridTemplateColumns: '32px minmax(0, 1fr) 24px' }}>
                                <span />
                                <div className="flex flex-col gap-2.5">
                                    {faq.a.map((block, j) => renderBlock(block, j))}
                                </div>
                                <span />
                            </div>
                        </details>
                    ))}
                </div>
            </section>

            <section
                className="border-t"
                style={{ borderColor: 'var(--line)', background: 'var(--tint)' }}
            >
                <div className="mx-auto max-w-[900px] px-6 py-16 text-center sm:px-10 lg:px-14">
                    <h3
                        className="m-0 mb-3"
                        style={{
                            fontSize: 28,
                            fontWeight: 500,
                            letterSpacing: '-0.025em',
                            color: 'var(--ink)',
                        }}
                    >
                        {dict.cta.title}
                    </h3>
                    <p
                        className="m-0 mb-7 text-[15px]"
                        style={{ color: 'var(--sub)' }}
                    >
                        {dict.cta.subtitle}
                    </p>
                    <a href={`/${country}/contacto`}>
                        <Btn variant="primary" size="lg" iconRight="arrow">
                            {dict.cta.button}
                        </Btn>
                    </a>
                </div>
            </section>
        </div>
    );
}
