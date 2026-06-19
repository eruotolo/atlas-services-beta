import type { ReactElement } from 'react';

import type { Dictionary } from '@/lib/i18n/types';
import { Mono, Pill } from '@/shared/components/hireeo';

interface ServicePricingListProps {
    dict: Dictionary;
    title: string;
    price: number;
    currencySymbol: string;
    locale: string;
}

function formatPrice(price: number, locale: string, symbol: string): string {
    if (price <= 0) return '—';
    return `${symbol}${price.toLocaleString(locale)}`;
}

export function ServicePricingList({
    dict,
    title,
    price,
    currencySymbol,
    locale,
}: ServicePricingListProps): ReactElement {
    return (
        // biome-ignore lint/correctness/useUniqueElementIds: anchor para tabs nav
        <section id="services">
            <h2
                className="m-0 mb-3.5 font-semibold text-ink"
                style={{
                    fontSize: 18,
                    letterSpacing: '-0.01em'}} 
            >
                {dict.serviceDetail.pricingTitle}
            </h2>

            <div className="border-t border-line">
                <div
                    className="grid items-center gap-4 border-b py-3.5 border-line"
                    style={{
                        gridTemplateColumns: 'minmax(0, 1fr) 130px 130px'}} 
                >
                    <span
                        className="text-[14px] font-medium text-ink"
                    >
                        {title}
                    </span>
                    <Mono className="text-[12px] text-sub">
                        {dict.serviceDetail.pricingDurationLabel}
                    </Mono>
                    <div
                        className="text-right text-[13.5px] font-semibold text-ink"
                    >
                        {formatPrice(price, locale, currencySymbol)}
                    </div>
                </div>
            </div>

            <Pill icon="info" tone="default" className="mt-3.5">
                {dict.serviceDetail.pricingReferenceHint}
            </Pill>
        </section>
    );
}
