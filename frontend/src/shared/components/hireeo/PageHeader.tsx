import type { ReactElement, ReactNode } from 'react';

import { Mono } from './Mono';

interface PageHeaderProps {
    breadcrumb?: string[];
    title: string;
    subtitle?: string;
    actions?: ReactNode;
}

export function PageHeader({
    breadcrumb,
    title,
    subtitle,
    actions,
}: PageHeaderProps): ReactElement {
    return (
        <header
            className="flex flex-wrap items-end justify-between gap-6"
            style={{
                padding: '28px 28px 22px',
                borderBottom: '1px solid var(--line)',
                background: 'var(--bg)',
            }}
        >
            <div className="min-w-0 flex-1">
                {breadcrumb && breadcrumb.length > 0 ? (
                    <Mono
                        className="text-[10.5px] font-semibold"
                        style={{
                            color: 'var(--muted)',
                            letterSpacing: '0.1em',
                            marginBottom: 8,
                        }}
                    >
                        {breadcrumb.map((b) => b.toUpperCase()).join(' · ')}
                    </Mono>
                ) : null}
                <h1
                    className="m-0"
                    style={{
                        fontSize: 26,
                        fontWeight: 500,
                        letterSpacing: '-0.025em',
                        color: 'var(--ink)',
                    }}
                >
                    {title}
                </h1>
                {subtitle ? (
                    <p
                        className="m-0 mt-1.5 max-w-2xl text-[13.5px]"
                        style={{ color: 'var(--sub)' }}
                    >
                        {subtitle}
                    </p>
                ) : null}
            </div>
            {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
        </header>
    );
}
