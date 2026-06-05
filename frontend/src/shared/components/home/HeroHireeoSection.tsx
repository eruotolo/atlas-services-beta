import Link from 'next/link';
import type { ReactElement } from 'react';

import type { Dictionary } from '@/lib/i18n/types';
import { Icon } from '@/shared/components/hireeo';
import type { Service } from '@/shared/types/common';
import { HeroSearchBar } from './HeroSearchBar';
import { HeroCountrySelector } from './HeroCountrySelector';
import { HomeCategories } from './HomeCategories';

interface HeroHireeoSectionProps {
    country: string;
    dict: Dictionary;
    previewServices: readonly Service[];
}

// Los países ahora son manejados dinámicamente por HeroCountrySelector


export function HeroHireeoSection({
    country,
    dict,
    previewServices,
}: HeroHireeoSectionProps): ReactElement {
    return (
        <section
            className="relative"
            style={{
                background: 'var(--bg)',
                color: 'var(--ink)',
            }}
        >
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(10,10,10,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(10,10,10,0.02) 1px, transparent 1px)',
                    backgroundSize: '60px 60px',
                    maskImage: 'linear-gradient(180deg, black 30%, transparent 90%)',
                    WebkitMaskImage: 'linear-gradient(180deg, black 30%, transparent 90%)',
                }}
            />

            <div className="relative z-[5] mx-auto max-w-site px-6 pt-10 pb-10 sm:px-10 lg:px-14 flex flex-col items-center text-center">

                <h1
                    className="m-0 mb-3 whitespace-nowrap"
                    style={{
                        fontSize: 'clamp(36px, 6vw, 82px)',
                        fontWeight: 500,
                        lineHeight: 1,
                        letterSpacing: '-0.04em',
                    }}
                >
                    {dict.home.hero2.titleBefore}{' '}
                    <span style={{ color: 'var(--accent)' }}>
                        {dict.home.hero2.titleAccent}
                    </span>
                    {dict.home.hero2.titleAfter}
                </h1>

                <p
                    className="mb-8 w-full text-[15px] leading-[1.5]"
                    style={{ color: 'var(--sub)' }}
                >
                    {dict.home.hero2.subtitle}
                </p>

                <HeroSearchBar country={country} />

                <HomeCategories />

                <div className="mt-8 flex items-center justify-center">
                    <Link
                        href={`/${country}/publicar`}
                        className="group flex items-center gap-3 rounded-full border px-5 py-3 text-[14px] font-semibold transition-all hover:shadow-md hover:-translate-y-0.5"
                        style={{ borderColor: 'var(--line)', color: 'var(--ink)', background: 'var(--bg)' }}
                    >
                        <span
                            className="flex h-7 w-7 items-center justify-center rounded-full"
                            style={{ background: 'var(--accent)' }}
                        >
                            <Icon name="briefcase" size={15} color="white" />
                        </span>
                        {dict.home.hero2.ctaProfessional}
                        <Icon name="arrowUR" size={15} className="opacity-50 transition-all group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                </div>

                <HeroCountrySelector 
                    currentCountry={country} 
                    label={dict.home.hero2.trustedLabel} 
                />
            </div>
        </section>
    );
}
