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
            className="relative flex items-center rounded-2xl border bg-bg transition-colors focus-within:border-ink"
            style={{ borderColor: 'var(--line)' }}
        >
            {icon ? (
                <span
                    className="pointer-events-none absolute left-4 inline-flex"
                    style={{ color: 'var(--muted)' }}
                >
                    <Icon name={icon} size={18} />
                </span>
            ) : null}
            <select
                className={[
                    'w-full appearance-none bg-transparent py-3 text-base outline-none',
                    icon ? 'pl-12' : 'pl-4',
                    'pr-10',
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
                className="pointer-events-none absolute right-4 inline-flex"
                style={{ color: 'var(--muted)' }}
            >
                <Icon name="chevronDown" size={18} />
            </span>
        </div>
    );
}
