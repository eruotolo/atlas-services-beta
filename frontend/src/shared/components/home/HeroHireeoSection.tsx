import Link from 'next/link';
import type { ReactElement } from 'react';

import type { Dictionary } from '@/lib/i18n/types';
import { Avatar, Btn, Icon, Mono, Pill, Stars } from '@/shared/components/hireeo';
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

            <div className="relative z-[5] mx-auto max-w-site px-6 pt-24 pb-20 sm:px-10 lg:px-14">
                <Pill icon="sparkle" className="mb-8 gap-2 py-1 pr-3 pl-1">
                    <span
                        className="rounded-full px-2 py-[2px] text-[10.5px] font-semibold"
                        style={{ background: 'var(--ink)', color: 'var(--bg)' }}
                    >
                        {dict.home.hero2.badge}
                    </span>
                    {dict.home.hero2.badgeText} →
                </Pill>

                <h1
                    className="m-0 mb-6 max-w-[1100px]"
                    style={{
                        fontSize: 'clamp(40px, 7vw, 84px)',
                        fontWeight: 500,
                        lineHeight: 0.96,
                        letterSpacing: '-0.045em',
                    }}
                >
                    {dict.home.hero2.titleBefore}{' '}
                    <span style={{ color: 'var(--accent)' }}>
                        {dict.home.hero2.titleAccent}
                    </span>
                    {dict.home.hero2.titleAfter}
                </h1>
                <p
                    className="mb-2 max-w-[600px] text-[18px] leading-[1.5]"
                    style={{ color: 'var(--sub)' }}
                >
                    {dict.home.hero2.subtitle}
                </p>

                <HeroSearchBar country={country} />

                <div className="mb-12 flex flex-wrap items-center gap-3">
                    <Link href={`/${country}/publicar`} className="group flex items-center gap-1.5 text-[14px] font-semibold transition-colors hover:text-accent" style={{ color: 'var(--ink)' }}>
                        {dict.home.hero2.ctaProfessional}
                        <Icon name="arrowUR" size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                </div>

                <HomeCategories />

                <HeroCountrySelector 
                    currentCountry={country} 
                    label={dict.home.hero2.trustedLabel} 
                />
            </div>
        </section>
    );
}
