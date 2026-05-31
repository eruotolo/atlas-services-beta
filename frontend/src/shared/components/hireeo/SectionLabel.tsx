import type { HTMLAttributes, ReactElement, ReactNode } from 'react';

interface SectionLabelProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    color?: string;
}

export function SectionLabel({
    children,
    color,
    className,
    style,
    ...rest
}: SectionLabelProps): ReactElement {
    return (
        <div
            className={['text-[11px] font-semibold uppercase', className].filter(Boolean).join(' ')}
            style={{
                color: color ?? 'var(--muted)',
                letterSpacing: '0.18em',
                ...style,
            }}
            {...rest}
        >
            {children}
        </div>
    );
}
