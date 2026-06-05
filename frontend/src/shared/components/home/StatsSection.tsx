import type { ReactElement } from 'react';

import type { Dictionary } from '@/lib/i18n/types';

interface StatsSectionProps {
    dict: Dictionary;
}

export function StatsSection({ dict }: StatsSectionProps): ReactElement {
    const stats = [
        { value: dict.home.stats.proCount, label: dict.home.stats.proLabel },
        { value: dict.home.stats.rating, label: dict.home.stats.ratingLabel },
        { value: dict.home.stats.responseTime, label: dict.home.stats.responseLabel },
        { value: dict.home.stats.jobs, label: dict.home.stats.jobsLabel },
    ];

    return (
        <section
            className="border-t"
            style={{ borderColor: 'var(--line)', background: 'var(--tint)' }}
        >
            <div className="mx-auto grid max-w-site grid-cols-2 gap-10 px-6 py-16 sm:px-10 md:grid-cols-4 lg:px-14">
                {stats.map((s) => (
                    <div key={s.label}>
                        <div
                            className="leading-none"
                            style={{
                                fontSize: 'clamp(28px, 3.4vw, 38px)',
                                fontWeight: 500,
                                letterSpacing: '-0.04em',
                                color: 'var(--ink)',
                            }}
                        >
                            {s.value}
                        </div>
                        <div
                            className="mt-2 text-[13px]"
                            style={{ color: 'var(--sub)' }}
                        >
                            {s.label}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
