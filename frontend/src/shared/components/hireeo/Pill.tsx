import type { HTMLAttributes, ReactElement, ReactNode } from 'react';

import { Icon } from './Icon';
import type { HireIconName } from './icons';

type PillTone = 'default' | 'accent' | 'success' | 'warning' | 'danger' | 'ink' | 'outline';

interface PillProps extends HTMLAttributes<HTMLSpanElement> {
    tone?: PillTone;
    icon?: HireIconName;
    children?: ReactNode;
}

const toneClasses: Record<PillTone, string> = {
    default: 'bg-tint text-sub border-line',
    accent: 'bg-accent-soft text-accent border-transparent',
    success: 'bg-success-soft text-success border-transparent',
    warning: 'bg-warning-soft text-[#A37A1E] border-transparent',
    danger: 'bg-danger-soft text-danger border-transparent',
    ink: 'bg-ink text-bg border-transparent',
    outline: 'bg-transparent text-ink border-line',
};

export function Pill({
    tone = 'default',
    icon,
    children,
    className,
    ...rest
}: PillProps): ReactElement {
    const base =
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[3px] text-[11px] font-semibold tracking-[-0.005em]';
    return (
        <span className={[base, toneClasses[tone], className].filter(Boolean).join(' ')} {...rest}>
            {icon ? <Icon name={icon} size={11} /> : null}
            {children}
        </span>
    );
}
