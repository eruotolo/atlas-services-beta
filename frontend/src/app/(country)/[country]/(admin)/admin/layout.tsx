import { redirect } from 'next/navigation';

import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';

import { AdminSidebar } from '@/features/admin/components/AdminSidebar';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const metadata: Metadata = {
    title: 'Panel de Administración',
    robots: {
        index: false,
        follow: false,
        googleBot: { index: false, follow: false },
    },
};

export default async function CountryAdminLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ country: string }>;
}) {
    const { country } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect(`/${country}/login`);
    }

    const userRoles = session.user.roles || [];
    if (!userRoles.includes('SuperAdministrador')) {
        redirect(`/${country}/unauthorized`);
    }

    const sessionUser = session.user as {
        name?: string | null;
        email?: string | null;
        avatar?: string | null;
        image?: string | null;
    };

    return (
        <div
            className="w-full"
            style={{
                minHeight: '100vh',
                background: 'var(--bg)',
                color: 'var(--ink)',
            }}
        >
            <div className="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)]">
                <AdminSidebar
                    country={country}
                    user={{
                        name: sessionUser.name || 'Admin',
                        email: sessionUser.email || '',
                        avatar: sessionUser.avatar || sessionUser.image || null,
                    }}
                />
                <main className="min-w-0">{children}</main>
            </div>
        </div>
    );
}
