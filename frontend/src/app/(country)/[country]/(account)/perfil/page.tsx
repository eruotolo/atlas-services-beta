import Link from 'next/link';
import { redirect } from 'next/navigation';

import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';

import { getServiceStats } from '@/features/analytics/actions';
import ProviderStatsCard from '@/features/analytics/components/provider/ProviderStatsCard';
import { getCategorias } from '@/features/categories/actions';
import { PageHeader } from '@/features/users/components/account/PageHeader';
import { UserShell } from '@/features/users/components/account/UserShell';
import { getProfilePageData } from '@/features/users/actions';
import MisServicios from '@/features/users/components/profile/MisServicios';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Btn, Card, Mono, Pill, Stat } from '@/shared/components/hireeo';

export const metadata: Metadata = {
    title: 'Mi Perfil',
    robots: { index: false, follow: false },
};

type Props = { params: Promise<{ country: string }> };

export default async function ProfilePage({ params }: Props) {
    const { country } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect(`/${country}/login`);
    }

    const [usuario, categorias] = await Promise.all([
        getProfilePageData(session.user.id),
        getCategorias(country),
    ]);

    if (!usuario) {
        redirect(`/${country}/login`);
    }

    const tienePremium = usuario.stats.premiumCount > 0;

    const serviceStats = await Promise.all(
        usuario.servicios.map(async (s) => ({
            servicioId: s.id,
            titulo: s.titulo,
            stats: await getServiceStats(s.id),
        })),
    );

    const firstName = usuario.name.split(' ')[0];

    return (
        <UserShell
            country={country}
            user={{ name: usuario.name, avatar: usuario.avatar, isPremium: tienePremium }}
            counts={{ servicios: usuario.stats.totalServicios }}
        >
            <PageHeader
                breadcrumb={['Mi cuenta', 'Resumen']}
                title={`Hola ${firstName}`}
                subtitle={`Tienes ${usuario.stats.totalServicios} servicios publicados y ${usuario.stats.totalCalificaciones} reseñas recibidas.`}
                actions={
                    <>
                        <Btn variant="secondary" icon="user" href={`/${country}/perfil/ajustes`}>
                            Ajustes
                        </Btn>
                        <Btn icon="plus" href={`/${country}/publicar`}>
                            Publicar servicio
                        </Btn>
                    </>
                }
            />

            <div style={{ padding: 28 }}>
                <div
                    className="mb-6 grid gap-3"
                    style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}
                >
                    <Card padding={20}>
                        <Stat
                            label="Servicios"
                            value={String(usuario.stats.totalServicios)}
                            sub="publicados"
                            icon="briefcase"
                        />
                    </Card>
                    <Card padding={20}>
                        <Stat
                            label="Reseñas"
                            value={String(usuario.stats.totalCalificaciones)}
                            sub="recibidas"
                            icon="star"
                        />
                    </Card>
                    <Card padding={20}>
                        <Stat
                            label="Premium"
                            value={String(usuario.stats.premiumCount)}
                            sub="destacados"
                            icon="crown"
                        />
                    </Card>
                    <Card padding={20}>
                        <Stat
                            label="Estado"
                            value={tienePremium ? 'Pro' : 'Free'}
                            sub={tienePremium ? 'plan activo' : 'plan básico'}
                            icon="shieldCheck"
                        />
                    </Card>
                </div>

                <Card padding={0} className="mb-4">
                    <div
                        className="flex items-center justify-between"
                        style={{
                            padding: '18px 22px',
                            borderBottom: '1px solid var(--line)',
                        }}
                    >
                        <div>
                            <h2
                                className="m-0"
                                style={{
                                    fontSize: 16,
                                    fontWeight: 600,
                                    letterSpacing: '-0.01em',
                                    color: 'var(--ink)',
                                }}
                            >
                                Mis servicios
                            </h2>
                            <Mono
                                className="text-[11px]"
                                style={{ color: 'var(--sub)' }}
                            >
                                {usuario.stats.totalServicios} publicados ·{' '}
                                {usuario.stats.premiumCount} premium
                            </Mono>
                        </div>
                        <Btn variant="secondary" size="sm" icon="plus" href={`/${country}/publicar`}>
                            Nuevo
                        </Btn>
                    </div>
                    <div style={{ padding: '8px 22px 22px' }}>
                        <MisServicios
                            servicios={usuario.servicios}
                            categorias={categorias}
                            usuario={{
                                id: usuario.id,
                                nombre: usuario.name,
                                email: usuario.email,
                                telefono: usuario.phone,
                            }}
                        />
                    </div>
                </Card>

                {serviceStats.length > 0 ? (
                    <Card padding={0} className="mb-4">
                        <div
                            style={{
                                padding: '18px 22px',
                                borderBottom: '1px solid var(--line)',
                            }}
                        >
                            <h2
                                className="m-0"
                                style={{
                                    fontSize: 16,
                                    fontWeight: 600,
                                    letterSpacing: '-0.01em',
                                    color: 'var(--ink)',
                                }}
                            >
                                Estadísticas por servicio
                            </h2>
                            <Mono className="text-[11px]" style={{ color: 'var(--sub)' }}>
                                Vistas, contactos y conversiones
                            </Mono>
                        </div>
                        <div
                            className="grid gap-4"
                            style={{ padding: 22, gridTemplateColumns: 'repeat(2, 1fr)' }}
                        >
                            {serviceStats.map((ss) => (
                                <ProviderStatsCard
                                    key={ss.servicioId}
                                    servicioTitulo={ss.titulo}
                                    stats={ss.stats}
                                />
                            ))}
                        </div>
                    </Card>
                ) : null}

                {!tienePremium ? (
                    <div
                        className="relative grid items-center gap-8 overflow-hidden"
                        style={{
                            padding: 28,
                            borderRadius: 14,
                            background: '#0A0A0A',
                            color: 'white',
                            gridTemplateColumns: '1.2fr 1fr',
                        }}
                    >
                        <div
                            aria-hidden
                            className="absolute h-[400px] w-[400px] rounded-full"
                            style={{
                                top: -100,
                                right: -100,
                                background:
                                    'radial-gradient(circle, color-mix(in srgb, var(--accent) 33%, transparent), transparent 65%)',
                                filter: 'blur(40px)',
                            }}
                        />
                        <div className="relative">
                            <Pill tone="accent" icon="crown" className="mb-3">
                                HIREEO PRO
                            </Pill>
                            <h3
                                className="m-0 mb-2.5"
                                style={{
                                    fontSize: 26,
                                    fontWeight: 500,
                                    letterSpacing: '-0.025em',
                                    color: 'white',
                                }}
                            >
                                Destaca tus servicios y aparece primero.
                            </h3>
                            <p
                                className="m-0 mb-5 max-w-md text-[14px]"
                                style={{ color: 'rgba(255,255,255,0.7)' }}
                            >
                                Pro te permite destacar servicios, recibir alertas instantáneas y
                                aparecer primero en las búsquedas de tu zona.
                            </p>
                            <Link
                                href={`/${country}/suscripcion-pro`}
                                className="inline-flex items-center gap-1.5 rounded-md bg-white px-5 py-2.5 text-[13px] font-semibold"
                                style={{ color: 'var(--ink)' }}
                            >
                                Ver planes Pro →
                            </Link>
                        </div>
                        <div
                            className="relative grid gap-2.5"
                            style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}
                        >
                            {[
                                ['+3,4×', 'más vistas'],
                                ['+5×', 'más clics'],
                                ['Top 8%', 'en tu categoría'],
                                ['Alertas', 'instantáneas'],
                            ].map(([n, l]) => (
                                <div
                                    key={l}
                                    style={{
                                        padding: 14,
                                        borderRadius: 9,
                                        background: 'rgba(255,255,255,0.06)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: 22,
                                            fontWeight: 500,
                                            letterSpacing: '-0.02em',
                                        }}
                                    >
                                        {n}
                                    </div>
                                    <Mono
                                        className="mt-1 text-[10px]"
                                        style={{
                                            color: 'rgba(255,255,255,0.6)',
                                            letterSpacing: '0.08em',
                                        }}
                                    >
                                        {l.toUpperCase()}
                                    </Mono>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null}
            </div>
        </UserShell>
    );
}
