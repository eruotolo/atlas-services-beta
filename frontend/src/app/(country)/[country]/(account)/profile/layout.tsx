import { redirect } from 'next/navigation';

import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getDictionary } from '@/lib/i18n/getDictionary';
import { COUNTRY_SEO_CONFIG } from '@/features/geo/lib/countryUtils';
import { getProfilePageData } from '@/features/users/actions';
import { UserSidebar } from '@/features/users/components/account/UserSidebar';

export const metadata: Metadata = {
    title: 'Mi Perfil',
    robots: {
        index: false,
        follow: false,
        googleBot: { index: false, follow: false },
    },
};

export default async function ProfileLayout({
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

    const usuario = await getProfilePageData(session.user.id);
    
    if (!usuario) {
        redirect(`/${country}/login`);
    }

    const tienePremium = usuario.stats.premiumCount > 0;
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
                <UserSidebar
                    country={country}
                    dictionary={dictionary.account.sidebar}
                    scopeLabel={countryName}
                    user={{
                        name: usuario.name,
                        email: usuario.email,
                        avatar: usuario.avatar,
                        isPremium: tienePremium,
                    }}
                    counts={{ servicios: usuario.stats.totalServicios }}
                />
                <main className="min-w-0">{children}</main>
            </div>
        </div>
    );
}
