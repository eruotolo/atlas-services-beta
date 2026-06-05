import type { ReactElement } from 'react';

import OwnerReplyForm from '@/features/reviews/components/OwnerReplyForm';
import type { Dictionary } from '@/lib/i18n/types';
import { Avatar, Btn, Icon, Mono, Stars } from '@/shared/components/hireeo';

import { ReviewToggleForm } from './ReviewToggleForm';
import { ServiceReviewsSummary } from './ServiceReviewsSummary';
import type { ServiceReview } from './types';

interface ServiceReviewsListProps {
    dict: Dictionary;
    serviceId: string;
    serviceSlug: string;
    serviceTitle: string;
    servicePrice: number;
    country: string;
    professionalName: string;
    currentUserName: string | null;
    rating: number;
    reviewsCount: number;
    reviews: readonly ServiceReview[];
    isOwner: boolean;
    isLoggedIn: boolean;
    locale: string;
    currencySymbol: string;
}

const SECOND = 1_000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

function formatRelativeDate(value: Date | string | null | undefined, locale: string): string {
    if (!value) return '';
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    const diff = d.getTime() - Date.now();
    const abs = Math.abs(diff);
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

    if (abs < MINUTE) return rtf.format(Math.round(diff / SECOND), 'second');
    if (abs < HOUR) return rtf.format(Math.round(diff / MINUTE), 'minute');
    if (abs < DAY) return rtf.format(Math.round(diff / HOUR), 'hour');
    if (abs < WEEK) return rtf.format(Math.round(diff / DAY), 'day');
    if (abs < MONTH) return rtf.format(Math.round(diff / WEEK), 'week');
    if (abs < YEAR) return rtf.format(Math.round(diff / MONTH), 'month');
    return rtf.format(Math.round(diff / YEAR), 'year');
}

function formatPrice(price: number, locale: string, symbol: string): string {
    if (price <= 0) return '—';
    return `${symbol}${price.toLocaleString(locale)}`;
}

interface ReviewItemProps {
    review: ServiceReview;
    isOwner: boolean;
    serviceId: string;
    serviceTitle: string;
    servicePrice: number;
    locale: string;
    currencySymbol: string;
}

function ReviewItem({
    review,
    isOwner,
    serviceId,
    serviceTitle,
    servicePrice,
    locale,
    currencySymbol,
}: ReviewItemProps): ReactElement {
    return (
        <div
            className="border-b py-5 last:border-b-0"
            style={{ borderColor: 'var(--line)' }}
        >
            <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <Avatar name={review.userName} size={30} />
                    <div>
                        <div
                            className="text-[13px] font-semibold"
                            style={{ color: 'var(--ink)' }}
                        >
                            {review.userName}
                        </div>
                        <Mono className="text-[11px]" style={{ color: 'var(--sub)' }}>
                            {formatRelativeDate(review.date, locale)}
                        </Mono>
                    </div>
                </div>
                <Stars rating={review.rating} size={12} />
            </div>
            <p
                className="m-0 mb-2.5 text-[14px]"
                style={{ color: 'var(--ink)', lineHeight: 1.55 }}
            >
                {review.comment}
            </p>
            <Mono className="text-[11px]" style={{ color: 'var(--muted)' }}>
                {serviceTitle} · {formatPrice(servicePrice, locale, currencySymbol)}
            </Mono>

            {review.ownerResponse ? (
                <div
                    className="mt-3 rounded-md border-l-2 py-2.5 pl-3 pr-3"
                    style={{
                        borderLeftColor: 'var(--accent)',
                        background: 'var(--accent-soft)',
                    }}
                >
                    <div className="mb-1 inline-flex items-center gap-1.5">
                        <Icon name="chat" size={12} stroke="var(--accent)" />
                        <span
                            className="text-[10.5px] font-semibold"
                            style={{ color: 'var(--accent)', letterSpacing: '0.05em' }}
                        >
                            Respuesta del profesional
                        </span>
                    </div>
                    <p
                        className="m-0 text-[12.5px]"
                        style={{ color: 'var(--ink)', lineHeight: 1.5 }}
                    >
                        {review.ownerResponse}
                    </p>
                </div>
            ) : null}

            {isOwner && !review.ownerResponse ? (
                <div className="mt-3">
                    <OwnerReplyForm serviceId={serviceId} ratingId={review.id} />
                </div>
            ) : null}
        </div>
    );
}

export function ServiceReviewsList({
    dict,
    serviceId,
    serviceSlug,
    serviceTitle,
    servicePrice,
    country,
    professionalName,
    currentUserName,
    rating,
    reviewsCount,
    reviews,
    isOwner,
    isLoggedIn,
    locale,
    currencySymbol,
}: ServiceReviewsListProps): ReactElement {
    const sample = reviews.slice(0, 5);

    return (
        // biome-ignore lint/correctness/useUniqueElementIds: anchor para tabs nav
        <section id="reviews">
            <div className="mb-4">
                <ReviewToggleForm
                    dict={dict}
                    serviceId={serviceId}
                    serviceSlug={serviceSlug}
                    serviceTitle={serviceTitle}
                    country={country}
                    isLoggedIn={isLoggedIn}
                    isOwner={isOwner}
                    professionalName={professionalName}
                    currentUserName={currentUserName}
                    hireDateLabel={null}
                    serviceReference={null}
                />
            </div>

            {reviewsCount === 0 ? (
                <div
                    className="rounded-xl border p-6 text-center"
                    style={{
                        borderColor: 'var(--line)',
                        background: 'var(--tint)',
                    }}
                >
                    <p className="m-0 text-[14px]" style={{ color: 'var(--sub)' }}>
                        {dict.serviceDetail.reviewsEmpty}
                    </p>
                    <p
                        className="m-0 mt-1 text-[12.5px]"
                        style={{ color: 'var(--muted)' }}
                    >
                        {dict.serviceDetail.reviewsEmptyHint}
                    </p>
                </div>
            ) : (
                <>
                    <ServiceReviewsSummary
                        dict={dict}
                        rating={rating}
                        totalReviews={reviewsCount}
                        reviews={reviews}
                    />
                    <div>
                        {sample.map((review) => (
                            <ReviewItem
                                key={review.id}
                                review={review}
                                isOwner={isOwner}
                                serviceId={serviceId}
                                serviceTitle={serviceTitle}
                                servicePrice={servicePrice}
                                locale={locale}
                                currencySymbol={currencySymbol}
                            />
                        ))}
                    </div>
                    {reviewsCount > sample.length ? (
                        <div className="mt-5">
                            <Btn variant="secondary" iconRight="arrow">
                                {dict.serviceDetail.reviewsViewAll}
                            </Btn>
                        </div>
                    ) : null}
                </>
            )}
        </section>
    );
}
