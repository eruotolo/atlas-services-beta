'use client';

import Link from 'next/link';
import type { ReactElement } from 'react';

import type { Dictionary } from '@/lib/i18n/types';
import { Avatar, Btn, Mono, Pill, Stars } from '@/shared/components/hireeo';
import type { Service } from '@/shared/types/common';

interface ProviderRowProps {
    service: Service;
    dict: Dictionary;
    locale?: string;
    currencySymbol?: string;
}

function formatPrice(price: number, locale: string, symbol: string): string {
    return `${symbol}${price.toLocaleString(locale)}`;
}

export function ProviderRow({
    service,
    dict,
    locale = 'es-CL',
    currencySymbol = '$',
}: ProviderRowProps): ReactElement {
    const categoryChips: string[] =
        service.categories && service.categories.length > 0
            ? service.categories.slice(0, 3).map((c) => c.nombre)
            : service.category
              ? [service.category]
              : [];

    const tier = service.isPremium ? dict.search.tierPro : null;

    return (
        <article
            className="grid items-center gap-4 rounded-xl border bg-bg p-4 md:gap-5 md:p-[18px]"
            style={{
                borderColor: 'var(--line)',
                gridTemplateColumns: '56px minmax(0, 1fr) 180px 140px',
            }}
        >
            <Avatar name={service.userName} size={56} ring />

            <div className="min-w-0">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                    <Link
                        href={`/service/${service.slug}`}
                        className="truncate text-[16px] font-semibold leading-tight transition-opacity hover:opacity-80"
                        style={{ color: 'var(--ink)', letterSpacing: '-0.01em' }}
                    >
                        {service.userName}
                    </Link>
                    {tier ? (
                        <Pill tone="accent" icon="sparkle">
                            {tier}
                        </Pill>
                    ) : null}
                </div>

                <p
                    className="m-0 mb-2 line-clamp-2 text-[13px]"
                    style={{ color: 'var(--sub)' }}
                >
                    {service.title}
                </p>

                <div className="flex flex-wrap items-center gap-3">
                    <Stars
                        rating={service.rating}
                        size={11}
                        showNum
                        count={service.reviewsCount}
                    />
                    {categoryChips.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                            {categoryChips.map((c) => (
                                <Mono
                                    key={c}
                                    className="rounded px-1.5 py-0.5 text-[10px]"
                                    style={{
                                        background: 'var(--tint)',
                                        color: 'var(--sub)',
                                        letterSpacing: '0.04em',
                                    }}
                                >
                                    {c}
                                </Mono>
                            ))}
                        </div>
                    ) : null}
                </div>
            </div>

            <div className="hidden md:block">
                <div className="text-[11px]" style={{ color: 'var(--sub)' }}>
                    {dict.search.priceFrom}
                </div>
                <div className="flex items-baseline gap-1.5">
                    <span
                        className="text-[22px] font-medium"
                        style={{ color: 'var(--ink)', letterSpacing: '-0.02em' }}
                    >
                        {formatPrice(service.price, locale, currencySymbol)}
                    </span>
                    <span className="text-[11px]" style={{ color: 'var(--muted)' }}>
                        {dict.search.priceVisit}
                    </span>
                </div>
            </div>

            <div className="flex flex-col gap-1.5">
                <Link href={`/service/${service.slug}`}>
                    <Btn variant="primary" iconRight="arrow" className="w-full justify-center">
                        {dict.search.contactCta}
                    </Btn>
                </Link>
                <Btn variant="secondary" size="sm" icon="bookmark" className="w-full justify-center">
                    {dict.search.saveCta}
                </Btn>
            </div>
        </article>
    );
}
