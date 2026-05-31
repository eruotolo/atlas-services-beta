import type { ReactElement } from 'react';

import { Icon } from './Icon';

interface StarsProps {
    rating: number;
    size?: number;
    showNum?: boolean;
    count?: number;
}

type StarSlot = 'pos-1' | 'pos-2' | 'pos-3' | 'pos-4' | 'pos-5';
const STAR_SLOTS: readonly StarSlot[] = ['pos-1', 'pos-2', 'pos-3', 'pos-4', 'pos-5'];

export function Stars({ rating, size = 14, showNum = false, count }: StarsProps): ReactElement {
    const clamped = Math.max(0, Math.min(5, rating));
    const full = Math.floor(clamped);
    const half = clamped - full >= 0.5;
    return (
        <span className="inline-flex items-center gap-1 text-amber" style={{ color: 'var(--amber)' }}>
            {STAR_SLOTS.map((slot, i) => {
                if (i < full) {
                    return (
                        <Icon
                            key={slot}
                            name="star"
                            size={size}
                            fill="currentColor"
                            stroke="currentColor"
                        />
                    );
                }
                if (i === full && half) {
                    return (
                        <Icon
                            key={slot}
                            name="starHalf"
                            size={size}
                            fill="currentColor"
                            stroke="currentColor"
                        />
                    );
                }
                return (
                    <Icon
                        key={slot}
                        name="star"
                        size={size}
                        stroke="currentColor"
                        className="opacity-30"
                    />
                );
            })}
            {showNum ? (
                <span
                    className="ml-1 text-[12px] font-semibold"
                    style={{ color: 'var(--ink)' }}
                >
                    {clamped.toFixed(1)}
                </span>
            ) : null}
            {typeof count === 'number' ? (
                <span className="ml-1 text-[11px]" style={{ color: 'var(--sub)' }}>
                    ({count})
                </span>
            ) : null}
        </span>
    );
}
