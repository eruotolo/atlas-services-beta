'use client';

import { useRouter } from 'next/navigation';
import { useTransition, type ReactElement } from 'react';

import { iniciarConversacion } from '@/features/chat/actions/mutations';
import { useCountryLink } from '@/features/geo/hooks/useCountryLink';
import type { Dictionary } from '@/lib/i18n/types';
import { Btn, Field, Input, Mono } from '@/shared/components/hireeo';

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
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const link = useCountryLink();

    function openConversation(): void {
        startTransition(async () => {
            const result = await iniciarConversacion(serviceId);
            if (result.conversationId) {
                router.push(link(`/profile/mensajes/${result.conversationId}`));
            }
        });
    }

    return (
        <div
            className="rounded-[14px] border p-5 border-line bg-bg"
            style={{
                boxShadow: '0 12px 40px rgba(10,10,10,0.04)'}} 
        >
            <div
                className="mb-4 border-b pb-3.5 border-line"
            >
                <div className="mb-0.5 text-[11px] text-sub">
                    {dict.serviceDetail.bookingFrom}
                </div>
                <div className="flex items-baseline gap-1.5">
                    <span
                        style={{
                            fontSize: 28,
                            letterSpacing: '-0.025em'}} className="font-medium text-ink"
                    >
                        {formatPrice(price, locale, currencySymbol)}
                    </span>
                    <Mono className="text-[12px] text-muted">
                        {dict.serviceDetail.bookingPerVisit}
                    </Mono>
                </div>
            </div>

            <Field label={dict.serviceDetail.bookingServiceLabel}>
                <Input
                    icon="briefcase"
                    value={serviceTitle}
                    readOnly
                    aria-label={dict.serviceDetail.bookingServiceLabel}
                />
            </Field>

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
                                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-[13px] font-semibold transition-colors hover:bg-tint border-line text-ink"
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
                    className="mt-4 grid grid-cols-3 gap-3 border-t pt-3.5 border-line"
                >
                    {stats.map((stat) => (
                        <div key={stat.label} className="text-center">
                            <div
                                style={{
                                    fontSize: 17,
                                    letterSpacing: '-0.015em'}} className="font-semibold text-ink"
                            >
                                {stat.value}
                            </div>
                            <Mono
                                className="mt-0.5 inline-block text-[10px] tracking-[0.08em] text-muted"
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
