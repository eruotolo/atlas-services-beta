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
        <div className="group relative overflow-hidden rounded-2xl border border-line bg-bg/80 p-5 shadow-sm backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-md dark:bg-tint/40">
            <div className="flex items-center justify-between text-[10.5px] font-semibold tracking-[0.12em] text-muted uppercase">
                <span>{label}</span>
                {icon ? <Icon name={icon} size={14} className="text-sub transition-colors group-hover:text-accent" /> : null}
            </div>
            <div className={`mt-3 font-mono font-medium tabular-nums tracking-tight leading-none text-ink ${big ? 'text-[34px]' : 'text-[24px]'}`}>
                {value}
            </div>
            <div className="mt-2 flex items-center gap-2">
                {sub ? (
                    <span className="text-[11.5px] font-medium text-sub">
                        {sub}
                    </span>
                ) : null}
                {trend && trendValue ? (
                    <span className={`inline-flex items-center gap-0.5 text-[11.5px] font-semibold ${trend === 'up' ? 'text-success' : trend === 'down' ? 'text-danger' : 'text-sub'}`}>
                        <Icon
                            name={trend === 'down' ? 'trendDown' : 'trend'}
                            size={11}
                        />
                        {trendValue}
                    </span>
                ) : null}
            </div>
            {/* Sutil gradiente decorativo en hover */}
            <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-accent/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>
    );
}
