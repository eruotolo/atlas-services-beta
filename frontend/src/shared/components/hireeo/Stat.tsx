import type { ReactElement } from 'react';

import { Icon } from './Icon';
import type { HireIconName } from './icons';

type Trend = 'up' | 'down' | 'neutral';

interface StatProps {
    label: string;
    value: string;
    sub?: string;
    trend?: Trend;
    trendValue?: string;
    icon?: HireIconName;
    big?: boolean;
}

const trendColor: Record<Trend, string> = {
    up: 'var(--success)',
    down: 'var(--danger)',
    neutral: 'var(--sub)',
};

export function Stat({
    label,
    value,
    sub,
    trend,
    trendValue,
    icon,
    big = false,
}: StatProps): ReactElement {
    return (
        <div
            className="rounded-xl border bg-bg p-4"
            style={{ borderColor: 'var(--line)' }}
        >
            <div
                className="flex items-center justify-between text-[10.5px] font-semibold tracking-[0.12em] uppercase"
                style={{ color: 'var(--muted)' }}
            >
                <span>{label}</span>
                {icon ? <Icon name={icon} size={14} /> : null}
            </div>
            <div
                className={`mt-2 font-medium tabular-nums ${big ? 'text-[34px]' : 'text-[22px]'}`}
                style={{ color: 'var(--ink)', letterSpacing: '-0.02em', lineHeight: 1.05 }}
            >
                {value}
            </div>
            <div className="mt-1 flex items-center gap-2">
                {sub ? (
                    <span className="text-[11.5px]" style={{ color: 'var(--sub)' }}>
                        {sub}
                    </span>
                ) : null}
                {trend && trendValue ? (
                    <span
                        className="inline-flex items-center gap-0.5 text-[11.5px] font-semibold"
                        style={{ color: trendColor[trend] }}
                    >
                        <Icon
                            name={trend === 'down' ? 'trendDown' : 'trend'}
                            size={11}
                        />
                        {trendValue}
                    </span>
                ) : null}
            </div>
        </div>
    );
}
