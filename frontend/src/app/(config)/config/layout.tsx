import { redirect } from 'next/navigation';

import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { AdminSidebar } from '@/features/admin/components/AdminSidebar';
import { ConfigPageHeader } from '@/features/admin/components/ConfigPageHeader';

export const metadata: Metadata = {
    title: 'Panel de Administración — Hireeo',
    robots: {
        index: false,
        follow: false,
        googleBot: { index: false, follow: false },
    },
};

export default async function ConfigLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect('/login');
    }

    const userRoles: string[] = session.user.roles ?? [];
    // /config administra todos los países: acceso exclusivo de SuperAdministrador
    const isAuthorized = userRoles.includes('SuperAdministrador');

    if (!isAuthorized) {
        redirect('/unauthorized');
    }

    const sessionUser = session.user as {
        id?: string;
        name?: string | null;
        email?: string | null;
        avatar?: string | null;
        image?: string | null;
        phone?: string | null;
        roles?: string[];
    };

    return (
        <div className="min-h-screen w-full bg-bg text-ink selection:bg-accent/20">
            <div className="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)]">
                <AdminSidebar
                    user={{
                        id: sessionUser.id ?? '',
                        name: sessionUser.name ?? 'Admin',
                        email: sessionUser.email ?? '',
                        telefono: sessionUser.phone ?? '',
                        avatar: sessionUser.avatar ?? sessionUser.image ?? null,
                        roles: sessionUser.roles ?? [],
                    }}
                />
                <div className="flex min-w-0 flex-col">
                    <ConfigPageHeader />
                    <main className="flex-1 bg-tint/30 dark:bg-bg">{children}</main>
                </div>
            </div>
        </div>
    );
}