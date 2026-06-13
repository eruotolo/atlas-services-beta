import type { ReactElement } from 'react';

import { Card, Mono, Pill } from '@/shared/components/hireeo';

import type { BackendQuote, BackendServiceRequest, ServiceRequestStatus } from '../../types/quotes';

type PillTone = 'default' | 'accent' | 'success' | 'warning' | 'danger' | 'ink' | 'outline';
import { QuoteCard } from './QuoteCard';

interface ServiceRequestCardProps {
    request: BackendServiceRequest;
    quotes: BackendQuote[];
    country: string;
}

const STATUS_LABELS: Record<ServiceRequestStatus, string> = {
    PENDING: 'Esperando cotizaciones',
    QUOTED: 'Tienes cotizaciones',
    ACCEPTED: 'Trabajo aceptado',
    COMPLETED: 'Completado',
    CANCELLED: 'Cancelado',
};

const STATUS_TONES: Record<ServiceRequestStatus, PillTone> = {
    PENDING: 'default',
    QUOTED: 'accent',
    ACCEPTED: 'success',
    COMPLETED: 'success',
    CANCELLED: 'warning',
};

const URGENCY_LABELS: Record<string, string> = {
    urgent: 'Urgente',
    this_week: 'Esta semana',
    whenever: 'Sin urgencia',
};

export function ServiceRequestCard({
    request,
    quotes,
    country,
}: ServiceRequestCardProps): ReactElement {
    const canAccept = request.status === 'QUOTED';
    const urgencyLabel = URGENCY_LABELS[request.urgency] ?? request.urgency;
    const dateLabel = new Date(request.createdAt).toLocaleDateString('es-CL', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });

    return (
        <Card padding={0} className="mb-4">
            <div
                className="flex flex-wrap items-start justify-between gap-3"
                style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)' }}
            >
                <div className="min-w-0 flex-1">
                    <p
                        className="mb-1.5 text-[14px] font-semibold leading-snug text-ink"
                    >
                        {request.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                        <Mono className="text-[11px] text-sub">
                            {urgencyLabel}
                        </Mono>
                        <span aria-hidden style={{ color: 'var(--line)' }}>
                            ·
                        </span>
                        <Mono className="text-[11px] text-sub">
                            {dateLabel}
                        </Mono>
                        {quotes.length > 0 ? (
                            <>
                                <span aria-hidden style={{ color: 'var(--line)' }}>
                                    ·
                                </span>
                                <Mono className="text-[11px] text-accent">
                                    {quotes.length} cotización{quotes.length !== 1 ? 'es' : ''}
                                </Mono>
                            </>
                        ) : null}
                    </div>
                </div>
                <Pill tone={STATUS_TONES[request.status]}>{STATUS_LABELS[request.status]}</Pill>
            </div>

            <div style={{ padding: '16px 20px' }}>
                {quotes.length > 0 ? (
                    <div className="flex flex-col gap-3">
                        {quotes.map((quote) => (
                            <QuoteCard
                                key={quote.id}
                                quote={quote}
                                canAccept={canAccept}
                                countryCode={country}
                                serviceDescription={request.description}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="text-[13px] text-sub">
                        Aún no hay cotizaciones. Los profesionales de tu zona verán esta solicitud
                        pronto.
                    </p>
                )}
            </div>
        </Card>
    );
}
