import Link from 'next/link';
import type { ReactElement } from 'react';

import type { Dictionary } from '@/lib/i18n/types';
import { Avatar, Btn, Icon, Mono, Pill, Stars } from '@/shared/components/hireeo';
import type { Service } from '@/shared/types/common';

interface HeroHireeoSectionProps {
    country: string;
    dict: Dictionary;
    previewServices: readonly Service[];
}

const COUNTRIES = [
    { code: 'CL', name: 'Chile' },
    { code: 'AR', name: 'Argentina' },
    { code: 'UY', name: 'Uruguay' },
    { code: 'ES', name: 'España' },
    { code: 'US', name: 'United States' },
] as const;

function formatPrice(price: number): string {
    return `$${price.toLocaleString('es-CL')}`;
}

function PreviewRow({
    service,
    highlight,
    contactLabel,
}: {
    service: Service;
    highlight: boolean;
    contactLabel: string;
}): ReactElement {
    return (
        <div
            className="mb-1.5 grid items-center gap-3 rounded-lg border p-3"
            style={{
                gridTemplateColumns: '36px 1.4fr 0.9fr 0.6fr 0.7fr 96px',
                borderColor: 'var(--line)',
                background: highlight ? 'var(--accent-soft)' : 'var(--bg)',
            }}
        >
            <Avatar name={service.userName} size={32} />
            <div>
                <div className="flex items-center gap-1.5">
                    <span
                        className="text-[13px] font-semibold"
                        style={{ color: 'var(--ink)' }}
                    >
                        {service.userName}
                    </span>
                    {service.isPremium ? (
                        <Pill tone="accent" style={{ fontSize: 9 }}>
                            PRO
                        </Pill>
                    ) : null}
                </div>
                <div className="mt-[1px] text-[11.5px]" style={{ color: 'var(--sub)' }}>
                    {service.category}
                </div>
            </div>
            <Stars rating={service.rating} showNum count={service.reviewsCount} size={11} />
            <div className="inline-flex items-center gap-1 text-[11.5px]" style={{ color: 'var(--sub)' }}>
                <Icon name="clock" size={11} />
                <span>—</span>
            </div>
            <div className="text-[12px] font-semibold" style={{ color: 'var(--ink)' }}>
                {formatPrice(service.price)}
            </div>
            <Btn size="sm" variant={highlight ? 'primary' : 'secondary'}>
                {contactLabel}
            </Btn>
        </div>
    );
}

function ProductPreview({
    country,
    dict,
    services,
}: {
    country: string;
    dict: Dictionary;
    services: readonly Service[];
}): ReactElement {
    const sample = services.slice(0, 3);
    const firstCategory = sample[0]?.category ?? '—';
    const filters: ReadonlyArray<{ label: string; value: string; on: boolean }> = [
        { label: 'Categoría', value: firstCategory, on: true },
        { label: 'Región', value: '—', on: true },
        { label: 'Localidad', value: sample[0]?.commune ?? sample[0]?.comuna ?? '—', on: true },
        { label: 'Disponibilidad', value: 'Hoy', on: true },
        { label: 'Verificado', value: 'Sí', on: true },
        { label: 'Rating', value: '≥ 4.5★', on: false },
    ];

    return (
        <div
            className="overflow-hidden rounded-[14px] border"
            style={{
                borderColor: 'var(--line)',
                background: 'var(--bg)',
                boxShadow:
                    '0 30px 80px rgba(10,10,10,0.06), 0 8px 30px rgba(10,10,10,0.04)',
            }}
        >
            <div
                className="flex items-center justify-between border-b px-5 py-3"
                style={{ borderColor: 'var(--line)', background: 'var(--tint)' }}
            >
                <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#E2E2E2' }} />
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#E2E2E2' }} />
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#E2E2E2' }} />
                </div>
                <Mono className="text-[11px]" style={{ color: 'var(--sub)' }}>
                    hireeo.app/{country}/buscar
                </Mono>
                <span className="w-16" />
            </div>

            <div className="grid" style={{ gridTemplateColumns: '240px 1fr' }}>
                <div
                    className="border-r p-5"
                    style={{ borderColor: 'var(--line)' }}
                >
                    <Mono
                        className="mb-3 block text-[10px] font-semibold"
                        style={{ color: 'var(--sub)', letterSpacing: '0.1em' }}
                    >
                        {dict.home.hero2.previewFiltersLabel}
                    </Mono>
                    {filters.map((f) => (
                        <div
                            key={f.label}
                            className="flex items-center justify-between border-b py-2.5"
                            style={{ borderColor: 'var(--line)' }}
                        >
                            <div>
                                <div className="text-[10.5px]" style={{ color: 'var(--muted)' }}>
                                    {f.label}
                                </div>
                                <div
                                    className="mt-[1px] text-[12.5px] font-medium"
                                    style={{ color: 'var(--ink)' }}
                                >
                                    {f.value}
                                </div>
                            </div>
                            <span
                                aria-hidden
                                className="inline-flex h-4 w-7 shrink-0 items-center rounded-full p-[2px]"
                                style={{ background: f.on ? 'var(--ink)' : 'var(--tint)' }}
                            >
                                <span
                                    className="inline-block h-3 w-3 rounded-full bg-white shadow-sm"
                                    style={{
                                        transform: f.on ? 'translateX(12px)' : 'translateX(0)',
                                    }}
                                />
                            </span>
                        </div>
                    ))}
                </div>

                <div className="p-5">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <div
                                className="text-[14px] font-semibold"
                                style={{ color: 'var(--ink)' }}
                            >
                                {sample.length} {dict.home.hero2.previewResultsTitle}
                            </div>
                            <div
                                className="mt-[1px] text-[11.5px]"
                                style={{ color: 'var(--sub)' }}
                            >
                                {dict.home.hero2.previewResultsHint}
                            </div>
                        </div>
                        <div className="flex gap-1">
                            <Mono
                                className="rounded border px-2.5 py-1 text-[11px]"
                                style={{
                                    borderColor: 'var(--line)',
                                    color: 'var(--sub)',
                                }}
                            >
                                map
                            </Mono>
                            <Mono
                                className="rounded px-2.5 py-1 text-[11px]"
                                style={{ background: 'var(--ink)', color: 'var(--bg)' }}
                            >
                                list
                            </Mono>
                        </div>
                    </div>

                    {sample.map((service, i) => (
                        <PreviewRow
                            key={service.id}
                            service={service}
                            highlight={i === 0}
                            contactLabel={dict.home.hero2.previewContact}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

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
                    className="mb-9 max-w-[600px] text-[18px] leading-[1.5]"
                    style={{ color: 'var(--sub)' }}
                >
                    {dict.home.hero2.subtitle}
                </p>

                <div className="mb-16 flex flex-wrap items-center gap-3">
                    <Link href={`/${country}/buscar`}>
                        <Btn size="lg" variant="primary" iconRight="arrow">
                            {dict.home.hero2.ctaSearch}
                        </Btn>
                    </Link>
                    <Link href={`/${country}/publicar`}>
                        <Btn size="lg" variant="secondary" iconRight="arrowUR">
                            {dict.home.hero2.ctaProfessional}
                        </Btn>
                    </Link>
                </div>

                <ProductPreview country={country} dict={dict} services={previewServices} />

                <div className="mt-16 flex flex-wrap items-center gap-7">
                    <Mono
                        className="text-[11px] font-semibold"
                        style={{ color: 'var(--sub)', letterSpacing: '0.15em' }}
                    >
                        {dict.home.hero2.trustedLabel}
                    </Mono>
                    {COUNTRIES.map((c) => (
                        <div key={c.code} className="flex items-baseline gap-1.5">
                            <Mono
                                className="text-[11px] font-semibold"
                                style={{ color: 'var(--accent)' }}
                            >
                                {c.code}
                            </Mono>
                            <span
                                className="text-[13px] font-medium"
                                style={{ color: 'var(--ink)' }}
                            >
                                {c.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
