import Link from 'next/link';
import type { ReactElement } from 'react';

import type { Dictionary } from '@/lib/i18n/types';
import { Icon, SectionLabel } from '@/shared/components/hireeo';

interface PricingSectionProps {
    country: string;
    dict: Dictionary;
}

interface Tier {
    key: 'personas' | 'pro' | 'empresas';
    tier: string;
    price: string;
    sub: string;
    features: readonly string[];
    cta: string;
    href: string;
    dark: boolean;
    badge?: string;
}

function buildTiers(country: string, dict: Dictionary): readonly Tier[] {
    const p = dict.home.pricing;
    return [
        {
            key: 'personas',
            tier: p.personasTier,
            price: p.personasPrice,
            sub: p.personasSub,
            features: [p.personasF1, p.personasF2, p.personasF3, p.personasF4],
            cta: p.personasCta,
            href: `/${country}/buscar`,
            dark: false,
        },
        {
            key: 'pro',
            tier: p.proTier,
            price: p.proPrice,
            sub: p.proSub,
            features: [p.proF1, p.proF2, p.proF3, p.proF4, p.proF5],
            cta: p.proCta,
            href: `/${country}/suscripcion-pro`,
            dark: true,
            badge: p.proBadge,
        },
        {
            key: 'empresas',
            tier: p.empresasTier,
            price: p.empresasPrice,
            sub: p.empresasSub,
            features: [p.empresasF1, p.empresasF2, p.empresasF3, p.empresasF4, p.empresasF5],
            cta: p.empresasCta,
            href: `/${country}/contacto`,
            dark: false,
        },
    ];
}

function TierCard({ tier }: { tier: Tier }): ReactElement {
    const isDark = tier.dark;
    return (
        <div
            className="relative rounded-xl p-7"
            style={{
                background: isDark ? 'var(--ink)' : 'var(--bg)',
                color: isDark ? 'var(--bg)' : 'var(--ink)',
                border: isDark ? 'none' : '1px solid var(--line)',
            }}
        >
            {tier.badge ? (
                <span
                    className="absolute top-3 right-3 rounded-full px-2 py-[3px] text-[9.5px] font-bold"
                    style={{
                        background: 'var(--accent-bright)',
                        color: 'var(--ink)',
                        letterSpacing: '0.08em',
                    }}
                >
                    {tier.badge}
                </span>
            ) : null}
            <div
                className="mb-3.5 text-[13px] font-semibold"
                style={{
                    color: isDark ? 'color-mix(in srgb, var(--bg) 60%, transparent)' : 'var(--sub)',
                }}
            >
                {tier.tier}
            </div>
            <div
                className="leading-none"
                style={{
                    fontSize: 42,
                    fontWeight: 500,
                    letterSpacing: '-0.04em',
                }}
            >
                {tier.price}
            </div>
            <div
                className="mt-1 mb-5 text-[11.5px]"
                style={{
                    color: isDark ? 'color-mix(in srgb, var(--bg) 60%, transparent)' : 'var(--sub)',
                }}
            >
                {tier.sub}
            </div>
            <Link
                href={tier.href}
                className="mb-5 block w-full rounded-md py-2.5 text-center text-[13px] font-semibold transition-opacity hover:opacity-90"
                style={{
                    background: isDark ? 'var(--bg)' : 'var(--ink)',
                    color: isDark ? 'var(--ink)' : 'var(--bg)',
                }}
            >
                {tier.cta}
            </Link>
            <ul className="m-0 list-none p-0">
                {tier.features.map((f) => (
                    <li
                        key={f}
                        className="flex items-center gap-2.5 py-1.5 text-[13px]"
                        style={{ color: isDark ? 'var(--bg)' : 'var(--ink)' }}
                    >
                        <Icon
                            name="check"
                            size={13}
                            stroke={isDark ? 'var(--accent-bright)' : 'var(--accent)'}
                        />
                        {f}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export function PricingSection({ country, dict }: PricingSectionProps): ReactElement {
    const tiers = buildTiers(country, dict);
    return (
        <section
            className="border-t"
            style={{ borderColor: 'var(--line)', background: 'var(--bg)' }}
        >
            <div className="mx-auto max-w-site px-6 py-24 sm:px-10 lg:px-14">
                <div className="mb-12 text-center">
                    <SectionLabel className="inline-block">
                        {dict.home.pricing.eyebrow}
                    </SectionLabel>
                    <h2
                        className="m-0 mt-3.5 mb-3"
                        style={{
                            fontSize: 'clamp(34px, 4.2vw, 48px)',
                            fontWeight: 500,
                            letterSpacing: '-0.04em',
                            lineHeight: 1,
                            color: 'var(--ink)',
                        }}
                    >
                        {dict.home.pricing.title}
                    </h2>
                    <p
                        className="m-0 text-[16px]"
                        style={{ color: 'var(--sub)' }}
                    >
                        {dict.home.pricing.subtitle}
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    {tiers.map((tier) => (
                        <TierCard key={tier.key} tier={tier} />
                    ))}
                </div>
            </div>
        </section>
    );
}
