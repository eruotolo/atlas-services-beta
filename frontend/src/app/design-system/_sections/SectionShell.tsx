import type { ReactElement, ReactNode } from 'react';

import { Mono, SectionLabel } from '@/shared/components/hireeo';

interface SectionShellProps {
    anchor: string;
    eyebrow: string;
    title: string;
    description?: string;
    children: ReactNode;
}

export function SectionShell({
    anchor,
    eyebrow,
    title,
    description,
    children,
}: SectionShellProps): ReactElement {
    return (
        <section id={anchor} className="border-b" style={{ borderColor: 'var(--line)' }}>
            <div className="mx-auto max-w-site px-14 py-20">
                <div className="mb-10 flex items-end justify-between gap-8">
                    <div className="max-w-[680px]">
                        <SectionLabel className="mb-2.5">{eyebrow}</SectionLabel>
                        <h2
                            className="m-0"
                            style={{
                                fontSize: 36,
                                fontWeight: 500,
                                letterSpacing: '-0.025em',
                                lineHeight: 1.05,
                                color: 'var(--ink)',
                            }}
                        >
                            {title}
                        </h2>
                        {description ? (
                            <p
                                className="mt-3 mb-0 text-[15px] leading-[1.55]"
                                style={{ color: 'var(--sub)' }}
                            >
                                {description}
                            </p>
                        ) : null}
                    </div>
                    <Mono className="text-[11px]" style={{ color: 'var(--muted)' }}>
                        #{anchor}
                    </Mono>
                </div>
                {children}
            </div>
        </section>
    );
}
