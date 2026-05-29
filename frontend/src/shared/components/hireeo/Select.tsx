import type { ReactElement, ReactNode, SelectHTMLAttributes } from 'react';

import { Icon } from './Icon';
import type { HireIconName } from './icons';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    icon?: HireIconName;
    children: ReactNode;
}

export function Select({ icon, className, children, ...rest }: SelectProps): ReactElement {
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
            <select
                className={[
                    'w-full appearance-none bg-transparent py-2 text-[13px] outline-none',
                    icon ? 'pl-9' : 'pl-3',
                    'pr-9',
                    className,
                ]
                    .filter(Boolean)
                    .join(' ')}
                style={{ color: 'var(--ink)' }}
                {...rest}
            >
                {children}
            </select>
            <span
                className="pointer-events-none absolute right-3 inline-flex"
                style={{ color: 'var(--muted)' }}
            >
                <Icon name="chevronDown" size={14} />
            </span>
        </div>
    );
}
