import type { ReactElement, ReactNode } from 'react';

import { UserSidebar } from './UserSidebar';

interface UserShellProps {
    country: string;
    user: { name: string; avatar?: string | null; isPremium?: boolean };
    counts?: { servicios?: number; mensajes?: number };
    children: ReactNode;
}

export function UserShell({ country, user, counts, children }: UserShellProps): ReactElement {
    return (
        <div
            className="w-full"
            style={{
                minHeight: '100vh',
                background: 'var(--bg)',
                color: 'var(--ink)',
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr)',
            }}
        >
            <div className="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)]">
                <UserSidebar country={country} user={user} counts={counts} />
                <main className="min-w-0">{children}</main>
            </div>
        </div>
    );
}
