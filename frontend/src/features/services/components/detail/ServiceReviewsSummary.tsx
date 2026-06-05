import type { ReactElement } from 'react';

import type { Dictionary } from '@/lib/i18n/types';
import { Mono, Stars } from '@/shared/components/hireeo';

import type { ServiceReview } from './types';

interface ServiceReviewsSummaryProps {
    dict: Dictionary;
    rating: number;
    totalReviews: number;
    reviews: readonly ServiceReview[];
}

interface BreakdownRow {
    stars: number;
    percent: number;
}

function computeBreakdown(reviews: readonly ServiceReview[]): readonly BreakdownRow[] {
    const total = reviews.length;
    if (total === 0) {
        return [5, 4, 3, 2, 1].map((s) => ({ stars: s, percent: 0 }));
    }
    const counts = [5, 4, 3, 2, 1].map((stars) => ({
        stars,
        percent: Math.round(
            (reviews.filter((r) => Math.round(r.rating) === stars).length / total) * 100,
        ),
    }));
    return counts;
}

export function ServiceReviewsSummary({
    dict,
    rating,
    totalReviews,
    reviews,
}: ServiceReviewsSummaryProps): ReactElement {
    const breakdown = computeBreakdown(reviews);

    return (
        <div
            className="mb-4 grid gap-8 rounded-xl border p-5"
            style={{
                gridTemplateColumns: 'minmax(140px, 180px) minmax(0, 1fr)',
                borderColor: 'var(--line)',
                background: 'var(--tint)',
            }}
        >
            <div>
                <div
                    className="leading-none"
                    style={{
                        fontSize: 42,
                        fontWeight: 500,
                        letterSpacing: '-0.04em',
                        color: 'var(--ink)',
                    }}
                >
                    {rating.toFixed(1).replace('.', ',')}
                </div>
                <div className="mt-1.5">
                    <Stars rating={rating} size={14} />
                </div>
                <div className="mt-1.5 text-[12px]" style={{ color: 'var(--sub)' }}>
                    {dict.serviceDetail.reviewsOf} {totalReviews}{' '}
                    {dict.search.professionalsFound.replace('profesionales', 'calificaciones')}
                </div>
            </div>

            <div className="flex flex-col gap-1">
                {breakdown.map((row) => (
                    <div
                        key={row.stars}
                        className="grid items-center gap-2"
                        style={{ gridTemplateColumns: '16px minmax(0, 1fr) 30px' }}
                    >
                        <Mono className="text-[11px]" style={{ color: 'var(--sub)' }}>
                            {row.stars}
                        </Mono>
                        <div
                            className="relative h-1.5 overflow-hidden rounded-full"
                            style={{ background: 'var(--line)' }}
                        >
                            <div
                                className="absolute inset-y-0 left-0 rounded-full"
                                style={{
                                    width: `${row.percent}%`,
                                    background: 'var(--ink)',
                                }}
                            />
                        </div>
                        <Mono
                            className="text-right text-[11px]"
                            style={{ color: 'var(--sub)' }}
                        >
                            {row.percent}%
                        </Mono>
                    </div>
                ))}
            </div>
        </div>
    );
}
