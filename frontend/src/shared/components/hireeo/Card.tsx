import type { HTMLAttributes, ReactElement, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    padding?: number | string;
    hover?: boolean;
}

export function Card({
    children,
    padding = 20,
    hover = false,
    className,
    style,
    ...rest
}: CardProps): ReactElement {
    return (
        <div
            className={[
                'rounded-[14px] border bg-bg',
                hover ? 'card-hover' : '',
                className,
            ]
                .filter(Boolean)
                .join(' ')}
            style={{
                borderColor: 'var(--line)',
                padding,
                ...style,
            }}
            {...rest}
        >
            {children}
        </div>
    );
}
