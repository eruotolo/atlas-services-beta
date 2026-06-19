import { redirect } from 'next/navigation';

import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';

import { AdminSidebar } from '@/features/admin/components/AdminSidebar';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getDictionary } from '@/lib/i18n/getDictionary';
import { COUNTRY_SEO_CONFIG } from '@/features/geo/lib/countryUtils';

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

    // SuperAdministrador entra siempre; Administrador solo al país que tiene asignado
    const userRoles = session.user.roles || [];
    const adminCountries = session.user.adminCountries ?? [];
    const isSuperAdmin = userRoles.includes('SuperAdministrador');
    const isCountryAdmin = userRoles.includes('Administrador') && adminCountries.includes(country);

    if (!isSuperAdmin && !isCountryAdmin) {
        redirect(`/${country}/unauthorized`);
    }

    const sessionUser = session.user as {
        id?: string;
        name?: string | null;
        email?: string | null;
        avatar?: string | null;
        image?: string | null;
        phone?: string | null;
    };

    const dictionary = await getDictionary(country);
    const countryName = COUNTRY_SEO_CONFIG[country]?.countryName ?? country.toUpperCase();

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
                    basePath={`/${country}/admin`}
                    dictionary={dictionary.admin.sidebar}
                    scopeLabel={countryName}
                    user={{
                        id: sessionUser.id ?? '',
                        name: sessionUser.name || 'Admin',
                        email: sessionUser.email || '',
                        telefono: sessionUser.phone || '',
                        avatar: sessionUser.avatar || sessionUser.image || null,
                        roles: (session.user as { roles?: string[] }).roles ?? [],
                    }}
                />
                <main className="min-w-0">{children}</main>
            </div>
        </div>
    );
}
