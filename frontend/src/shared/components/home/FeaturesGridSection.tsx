import type { ReactElement } from 'react';

import type { Dictionary } from '@/lib/i18n/types';
import { Icon, Mono, SectionLabel } from '@/shared/components/hireeo';
import type { HireIconName } from '@/shared/components/hireeo/icons';

interface FeaturesGridSectionProps {
    dict: Dictionary;
}

interface Feature {
    n: string;
    title: string;
    desc: string;
    icon: HireIconName;
}

function buildFeatures(dict: Dictionary): readonly Feature[] {
    const f = dict.home.features;
    return [
        { n: '01', title: f.f1Title, desc: f.f1Desc, icon: 'sparkle' },
        { n: '02', title: f.f2Title, desc: f.f2Desc, icon: 'globe' },
        { n: '03', title: f.f3Title, desc: f.f3Desc, icon: 'shield' },
        { n: '04', title: f.f4Title, desc: f.f4Desc, icon: 'card' },
        { n: '05', title: f.f5Title, desc: f.f5Desc, icon: 'chat' },
        { n: '06', title: f.f6Title, desc: f.f6Desc, icon: 'briefcase' },
    ];
}

export function FeaturesGridSection({ dict }: FeaturesGridSectionProps): ReactElement {
    const features = buildFeatures(dict);
    return (
        <section
            className="border-t"
            style={{ borderColor: 'var(--line)', background: 'var(--bg)' }}
        >
            <div className="mx-auto max-w-site px-6 py-20 sm:px-10 lg:px-14">
                <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-[0.7fr_1fr] md:gap-20">
                    <div>
                        <SectionLabel>{dict.home.product.eyebrow}</SectionLabel>
                        <h2
                            className="m-0 mt-3.5"
                            style={{
                                fontSize: 'clamp(32px, 4vw, 48px)',
                                fontWeight: 500,
                                letterSpacing: '-0.04em',
                                lineHeight: 0.98,
                                color: 'var(--ink)',
                            }}
                        >
                            {dict.home.product.title}
                        </h2>
                    </div>
                    <div
                        className="pt-3.5 text-[16px] leading-[1.6]"
                        style={{ color: 'var(--sub)' }}
                    >
                        {dict.home.product.lead}
                    </div>
                </div>

                <div
                    className="grid grid-cols-1 border-t sm:grid-cols-2 md:grid-cols-3"
                    style={{ borderColor: 'var(--line)' }}
                >
                    {features.map((f, i) => (
                        <div
                            key={f.n}
                            className="border-b p-6 md:p-8"
                            style={{
                                borderRightColor: 'var(--line)',
                                borderBottomColor: 'var(--line)',
                                borderRightWidth: i % 3 === 2 ? 0 : 1,
                                borderRightStyle: 'solid',
                            }}
                        >
                            <div className="mb-6 flex items-center justify-between">
                                <Mono
                                    className="text-[11px]"
                                    style={{ color: 'var(--sub)', letterSpacing: '0.08em' }}
                                >
                                    {f.n}
                                </Mono>
                                <div
                                    className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-md"
                                    style={{ background: 'var(--tint)' }}
                                >
                                    <Icon name={f.icon} size={14} />
                                </div>
                            </div>
                            <h3
                                className="m-0 mb-1.5"
                                style={{
                                    fontSize: 17.5,
                                    fontWeight: 600,
                                    letterSpacing: '-0.01em',
                                    color: 'var(--ink)',
                                }}
                            >
                                {f.title}
                            </h3>
                            <p
                                className="m-0 text-[13.5px] leading-[1.55]"
                                style={{ color: 'var(--sub)' }}
                            >
                                {f.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
