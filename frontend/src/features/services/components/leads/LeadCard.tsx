'use client';

import { useState, type ReactElement } from 'react';

import { Avatar, Mono, Pill } from '@/shared/components/hireeo';

import type { AvailableLead } from '../../types/leads';
import { QuoteForm } from './QuoteForm';

interface LeadCardProps {
    lead: AvailableLead;
    countryCode: string;
}

const URGENCY_MAP: Record<string, { label: string; tone: 'danger' | 'warning' | 'default' }> = {
    urgent: { label: 'Urgente', tone: 'danger' },
    this_week: { label: 'Esta semana', tone: 'warning' },
    whenever: { label: 'Sin urgencia', tone: 'default' },
};

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 60) return `hace ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `hace ${hours} h`;
    const days = Math.floor(hours / 24);
    return `hace ${days} d`;
}

export function LeadCard({ lead, countryCode }: LeadCardProps): ReactElement {
    const [expanded, setExpanded] = useState(false);
    const urgency = URGENCY_MAP[lead.urgency] ?? { label: lead.urgency, tone: 'default' as const };
    const quotesCount = lead.quotes.length;

    return (
        <div
            className="rounded-2xl transition-all"
            style={{
                border: '1px solid var(--line)',
                background: expanded ? 'var(--tint)' : 'var(--bg)',
                overflow: 'hidden',
            }}
        >
            {/* ── Header ─────────────────────────────────────────────────── */}
            <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="flex w-full cursor-pointer items-start justify-between gap-4 text-left"
                style={{ padding: '16px 20px' }}
                aria-expanded={expanded}
            >
                <div className="min-w-0 flex-1">
                    <p
                        className="mb-2 text-[14px] font-semibold leading-snug"
                        style={{ color: 'var(--ink)' }}
                    >
                        {lead.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                        <Pill tone={urgency.tone}>{urgency.label}</Pill>
                        <Mono className="text-[11px]" style={{ color: 'var(--sub)' }}>
                            {lead.category.name}
                        </Mono>
                        <span aria-hidden style={{ color: 'var(--line)' }}>·</span>
                        <Mono className="text-[11px]" style={{ color: 'var(--sub)' }}>
                            {timeAgo(lead.createdAt)}
                        </Mono>
                        {quotesCount > 0 ? (
                            <>
                                <span aria-hidden style={{ color: 'var(--line)' }}>·</span>
                                <Mono className="text-[11px]" style={{ color: 'var(--accent)' }}>
                                    {quotesCount} cotización{quotesCount !== 1 ? 'es' : ''}
                                </Mono>
                            </>
                        ) : null}
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                    {/* Avatar del cliente */}
                    <Avatar
                        name={lead.user.name}
                        src={lead.user.avatar ?? undefined}
                        size={32}
                    />
                    {/* Chevron */}
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        aria-hidden
                        style={{
                            transition: 'transform 0.2s',
                            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                            flexShrink: 0,
                        }}
                    >
                        <path
                            d="M4 6l4 4 4-4"
                            stroke="var(--sub)"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
            </button>

            {/* ── Expanded: quote form ────────────────────────────────────── */}
            {expanded ? (
                <div
                    style={{
                        padding: '0 20px 20px',
                        borderTop: '1px solid var(--line)',
                        paddingTop: 16,
                    }}
                >
                    <p
                        className="mb-3 text-[12px]"
                        style={{ color: 'var(--sub)' }}
                    >
                        Enviá tu propuesta al cliente. Verá tu nombre, precio y mensaje.
                    </p>
                    <QuoteForm
                        serviceRequestId={lead.id}
                        countryCode={countryCode}
                        onSuccess={() => setExpanded(false)}
                    />
                </div>
            ) : null}
        </div>
    );
}
