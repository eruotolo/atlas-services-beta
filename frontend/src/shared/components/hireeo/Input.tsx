import type { InputHTMLAttributes, ReactElement, ReactNode } from 'react';

import { Icon } from './Icon';
import type { HireIconName } from './icons';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    icon?: HireIconName;
    suffix?: ReactNode;
}

export function Input({ icon, suffix, className, ...rest }: InputProps): ReactElement {
    return (
        <div
            className="relative flex items-center rounded-lg border bg-bg transition-colors focus-within:border-ink"
            style={{ borderColor: 'var(--line)' }}
        >
            {icon ? (
                <span
                    className="pointer-events-none absolute left-3 inline-flex"
                    style={{ color: 'var(--muted)' }}
                >
                    <Icon name={icon} size={14} />
                </span>
            ) : null}
            <input
                className={[
                    'w-full bg-transparent py-2 text-[13px] outline-none placeholder:text-muted',
                    icon ? 'pl-9' : 'pl-3',
                    suffix ? 'pr-3' : 'pr-3',
                    className,
                ]
                    .filter(Boolean)
                    .join(' ')}
                style={{ color: 'var(--ink)' }}
                {...rest}
            />
            {suffix ? (
                <span
                    className="pr-3 text-[11px] font-medium whitespace-nowrap"
                    style={{ color: 'var(--sub)' }}
                >
                    {suffix}
                </span>
            ) : null}
        </div>
    );
}
