import type { HTMLAttributes, ReactElement, ReactNode } from 'react';

interface MonoProps extends HTMLAttributes<HTMLSpanElement> {
    children?: ReactNode;
}

export function Mono({ children, className, style, ...rest }: MonoProps): ReactElement {
    return (
        <span
            className={['font-mono', className].filter(Boolean).join(' ')}
            style={{ fontFeatureSettings: '"tnum"', ...style }}
            {...rest}
        >
            {children}
        </span>
    );
}
