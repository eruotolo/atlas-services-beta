import type { ReactElement } from 'react';

import { Avatar, Icon } from '@/shared/components/hireeo';

import type { BackendQuote } from '../../types/quotes';
import { AcceptQuoteButton } from './AcceptQuoteButton';
import { PayNowButton } from './PayNowButton';

interface QuoteCardProps {
    quote: BackendQuote;
    canAccept: boolean;
    countryCode: string;
    /** Descripción de la solicitud de servicio, para mostrar en el modal de pago */
    serviceDescription?: string;
}

function formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0,
    }).format(price);
}

export function QuoteCard({
    quote,
    canAccept,
    countryCode,
    serviceDescription,
}: QuoteCardProps): ReactElement {
    return (
        <div
            className="flex flex-col gap-3 rounded-2xl border p-4"
            style={{
                borderColor: quote.accepted ? 'var(--success)' : 'var(--line)',
                background: quote.accepted
                    ? 'color-mix(in srgb, var(--success) 6%, var(--bg))'
                    : 'var(--tint)',
            }}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Avatar
                        name={quote.provider.name}
                        src={quote.provider.avatar ?? undefined}
                        size={36}
                    />
                    <div>
                        <p
                            className="text-[13px] font-semibold text-ink"
                        >
                            {quote.provider.name}
                        </p>
                        <p className="text-[11px] text-sub">
                            Profesional
                        </p>
                    </div>
                </div>

                <div className="text-right">
                    <p
                        className="text-[17px] font-bold tabular-nums text-ink"
                    >
                        {formatPrice(quote.price)}
                    </p>
                    {quote.accepted ? (
                        <span
                            className="inline-flex items-center gap-1 text-[11px] font-semibold"
                            style={{ color: 'var(--success)' }}
                        >
                            <Icon name="check" size={11} stroke="var(--success)" />
                            Aceptada
                        </span>
                    ) : null}
                </div>
            </div>

            {quote.message ? (
                <p
                    className="text-[13px] leading-relaxed text-sub"
                >
                    {quote.message}
                </p>
            ) : null}

            {canAccept && !quote.accepted ? (
                <AcceptQuoteButton quoteId={quote.id} countryCode={countryCode} />
            ) : null}

            {quote.accepted ? (
                <PayNowButton
                    quoteId={quote.id}
                    price={quote.price}
                    countryCode={countryCode}
                    serviceDescription={serviceDescription}
                    providerName={quote.provider.name}
                />
            ) : null}
        </div>
    );
}
