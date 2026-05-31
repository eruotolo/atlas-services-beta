'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition, type ReactElement } from 'react';

import { iniciarConversacion } from '@/features/chat/actions/mutations';
import { useCountryLink } from '@/features/geo/hooks/useCountryLink';
import type { Dictionary } from '@/lib/i18n/types';
import { Btn, Field, Input, Mono, Pill } from '@/shared/components/hireeo';

interface BookingStat {
    value: string;
    label: string;
}

interface ServiceBookingCardProps {
    dict: Dictionary;
    serviceId: string;
    serviceTitle: string;
    price: number;
    currencySymbol: string;
    locale: string;
    isOwner: boolean;
    contactPhone: string | null;
    stats: readonly BookingStat[];
}

function formatPrice(price: number, locale: string, symbol: string): string {
    if (price <= 0) return '—';
    return `${symbol}${price.toLocaleString(locale)}`;
}

export function ServiceBookingCard({
    dict,
    serviceId,
    serviceTitle,
    price,
    currencySymbol,
    locale,
    isOwner,
    contactPhone,
    stats,
}: ServiceBookingCardProps): ReactElement {
    const [address, setAddress] = useState<string>('');
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const link = useCountryLink();

    function openConversation(): void {
        startTransition(async () => {
            const result = await iniciarConversacion(serviceId);
            if (result.conversationId) {
                router.push(link(`/perfil/mensajes/${result.conversationId}`));
            }
        });
    }

    return (
        <div
            className="rounded-[14px] border p-5"
            style={{
                borderColor: 'var(--line)',
                background: 'var(--bg)',
                boxShadow: '0 12px 40px rgba(10,10,10,0.04)',
            }}
        >
            <div
                className="mb-4 flex items-center justify-between border-b pb-3.5"
                style={{ borderColor: 'var(--line)' }}
            >
                <div>
                    <div className="mb-0.5 text-[11px]" style={{ color: 'var(--sub)' }}>
                        {dict.serviceDetail.bookingFrom}
                    </div>
                    <div className="flex items-baseline gap-1.5">
                        <span
                            style={{
                                fontSize: 28,
                                fontWeight: 500,
                                letterSpacing: '-0.025em',
                                color: 'var(--ink)',
                            }}
                        >
                            {formatPrice(price, locale, currencySymbol)}
                        </span>
                        <Mono className="text-[12px]" style={{ color: 'var(--muted)' }}>
                            {dict.serviceDetail.bookingPerVisit}
                        </Mono>
                    </div>
                </div>
                <Pill tone="success" icon="check">
                    {dict.serviceDetail.bookingAvailableToday}
                </Pill>
            </div>

            <Field label={dict.serviceDetail.bookingServiceLabel}>
                <Input
                    icon="briefcase"
                    value={serviceTitle}
                    readOnly
                    aria-label={dict.serviceDetail.bookingServiceLabel}
                />
            </Field>

            <div className="h-3" />

            <Field label={dict.serviceDetail.bookingWhenLabel}>
                <Input
                    icon="calendar"
                    placeholder="Hoy"
                    aria-label={dict.serviceDetail.bookingWhenLabel}
                />
            </Field>

            <div className="h-3" />

            <Field label={dict.serviceDetail.bookingAddressLabel}>
                <Input
                    icon="pin"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="—"
                    aria-label={dict.serviceDetail.bookingAddressLabel}
                />
            </Field>

            <div
                className="mt-4 rounded-md p-3 text-[12px]"
                style={{
                    background: 'var(--tint)',
                    color: 'var(--sub)',
                    lineHeight: 1.5,
                }}
            >
                {dict.serviceDetail.bookingDisclaimer}
            </div>

            {isOwner ? null : (
                <>
                    <Btn
                        variant="primary"
                        size="lg"
                        iconRight="arrow"
                        onClick={openConversation}
                        disabled={isPending}
                        className="mt-4 w-full justify-center"
                    >
                        {dict.serviceDetail.bookingRequestCta}
                    </Btn>

                    <div className="mt-2 grid grid-cols-2 gap-2">
                        <Btn
                            variant="secondary"
                            icon="chat"
                            onClick={openConversation}
                            disabled={isPending}
                            className="w-full justify-center"
                        >
                            {dict.serviceDetail.bookingChatCta}
                        </Btn>
                        {contactPhone ? (
                            <a
                                href={`tel:${contactPhone.replace(/\s/g, '')}`}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-[13px] font-semibold transition-colors hover:bg-tint"
                                style={{
                                    borderColor: 'var(--line)',
                                    color: 'var(--ink)',
                                }}
                            >
                                <span className="inline-flex items-center gap-2">
                                    {dict.serviceDetail.bookingCallCta}
                                </span>
                            </a>
                        ) : (
                            <Btn
                                variant="secondary"
                                icon="phone"
                                disabled
                                className="w-full justify-center"
                            >
                                {dict.serviceDetail.bookingCallCta}
                            </Btn>
                        )}
                    </div>
                </>
            )}

            {stats.length > 0 ? (
                <div
                    className="mt-4 grid grid-cols-3 gap-3 border-t pt-3.5"
                    style={{ borderColor: 'var(--line)' }}
                >
                    {stats.map((stat) => (
                        <div key={stat.label} className="text-center">
                            <div
                                style={{
                                    fontSize: 17,
                                    fontWeight: 600,
                                    color: 'var(--ink)',
                                    letterSpacing: '-0.015em',
                                }}
                            >
                                {stat.value}
                            </div>
                            <Mono
                                className="mt-0.5 inline-block text-[10px]"
                                style={{
                                    color: 'var(--muted)',
                                    letterSpacing: '0.08em',
                                }}
                            >
                                {stat.label.toUpperCase()}
                            </Mono>
                        </div>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
