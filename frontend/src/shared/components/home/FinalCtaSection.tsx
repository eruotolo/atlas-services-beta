import Link from 'next/link';
import type { ReactElement } from 'react';

import type { Dictionary } from '@/lib/i18n/types';
import { Btn } from '@/shared/components/hireeo';

interface FinalCtaSectionProps {
    country: string;
    dict: Dictionary;
}

export function FinalCtaSection({ country, dict }: FinalCtaSectionProps): ReactElement {
    return (
        <section
            className="border-t"
            style={{ borderColor: 'var(--line)', background: 'var(--bg)' }}
        >
            <div
                className="mx-auto px-6 py-24 text-center sm:px-10 lg:px-14"
                style={{ maxWidth: 900 }}
            >
                <h2
                    className="m-0 mb-4"
                    style={{
                        fontSize: 'clamp(36px, 5vw, 52px)',
                        fontWeight: 500,
                        letterSpacing: '-0.04em',
                        lineHeight: 1.02,
                        color: 'var(--ink)',
                    }}
                >
                    {dict.home.finalCta.titleBefore}
                    <br />
                    {dict.home.finalCta.titleAfter}
                </h2>
                <p
                    className="m-0 mb-8 text-[16px]"
                    style={{ color: 'var(--sub)' }}
                >
                    {dict.home.finalCta.subtitle}
                </p>
                <div className="flex flex-wrap justify-center gap-2.5">
                    <Link href={`/${country}/buscar`}>
                        <Btn size="lg" variant="primary" iconRight="arrow">
                            {dict.home.finalCta.ctaSearch}
                        </Btn>
                    </Link>
                    <Link href={`/${country}/como-funciona`}>
                        <Btn size="lg" variant="secondary">
                            {dict.home.finalCta.ctaDemo}
                        </Btn>
                    </Link>
                </div>
            </div>
        </section>
    );
}
