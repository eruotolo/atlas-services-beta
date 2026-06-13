import Link from 'next/link';
import type { ReactElement } from 'react';

import type { Dictionary } from '@/lib/i18n/types';
import { Avatar, Icon, Mono, Stars } from '@/shared/components/hireeo';
import type { Service } from '@/shared/types/common';

interface RelatedServicesProps {
    dict: Dictionary;
    country: string;
    category: string;
    services: readonly Service[];
    currencySymbol: string;
    locale: string;
}

function formatPrice(price: number, locale: string, symbol: string): string {
    if (price <= 0) return '—';
    return `${symbol}${price.toLocaleString(locale)}`;
}

export function RelatedServices({
    dict,
    country,
    category,
    services,
    currencySymbol,
    locale,
}: RelatedServicesProps): ReactElement | null {
    if (services.length === 0) return null;

    return (
        <section
            className="border-t border-line"
        >
            <div className="mx-auto max-w-site px-6 py-10 sm:px-10 lg:px-14">
                <div className="mb-5 flex items-end justify-between gap-4">
                    <h2
                        className="m-0 font-medium tracking-[-0.02em] text-ink"
                        style={{
                            fontSize: 22}} 
                    >
                        {dict.serviceDetail.relatedTitle}
                    </h2>
                    <Link
                        href={`/${country}/search?c=${encodeURIComponent(category)}`}
                        className="inline-flex items-center gap-1 text-[13px] text-sub"
                    >
                        {dict.serviceDetail.relatedViewAll}
                        <Icon name="arrow" size={12} />
                    </Link>
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {services.slice(0, 4).map((s) => (
                        <Link
                            key={s.id}
                            href={`/${country}/service/${s.slug}`}
                            className="rounded-[11px] border bg-bg p-4 transition-shadow hover:shadow-sm border-line"
                        >
                            <Avatar name={s.userName} size={40} />
                            <div
                                className="mt-3 text-[14px] font-semibold text-ink"
                            >
                                {s.userName}
                            </div>
                            <div
                                className="mt-0.5 text-[12px] text-sub"
                            >
                                {s.category} · {s.commune}
                            </div>
                            <div className="mt-2.5 flex items-center justify-between">
                                <Stars
                                    rating={s.rating}
                                    size={11}
                                    showNum
                                    count={s.reviewsCount}
                                />
                                <Mono
                                    className="text-[12px] font-semibold text-ink"
                                >
                                    {formatPrice(s.price, locale, currencySymbol)}
                                </Mono>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
