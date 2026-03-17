import { redirect } from 'next/navigation';

import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';

import AdminHeader from '@/shared/components/admin/AdminHeader';
import AdminSidebar from '@/shared/components/admin/AdminSidebar';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const metadata: Metadata = {
    title: 'Panel de Administración',
    robots: {
        index: false,
        follow: false,
        googleBot: {
            index: false,
            follow: false,
        },
    },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions);

    // Doble verificación de permisos (middleware + layout)
    if (!session?.user) {
        redirect('/login');
    }

    const userRoles = session.user.roles || [];
    if (!userRoles.includes('SuperAdministrador')) {
        redirect('/unauthorized');
    }

    return (
        <div className="bg-background flex min-h-screen transition-colors duration-300">
            <AdminSidebar />
            <main className="scrollbar-custom flex-grow overflow-y-auto p-4 md:p-12">
                <div className="mx-auto max-w-6xl">
                    <AdminHeader
                        user={{
                            name: session.user.name,
                            email: session.user.email,
                            image:
                                (session.user as { avatar?: string }).avatar || session.user.image,
                        }}
                    />
                    {children}
                </div>
            </main>
        </div>
    );
}
