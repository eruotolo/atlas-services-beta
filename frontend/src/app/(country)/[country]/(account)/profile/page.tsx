import Link from 'next/link';
import { redirect } from 'next/navigation';

import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';

import { getServiceStats } from '@/features/analytics/actions';
import ProviderStatsCard from '@/features/analytics/components/provider/ProviderStatsCard';
import { getCategorias } from '@/features/categories/actions';

import { getProfilePageData } from '@/features/users/actions';
import MisServicios from '@/features/users/components/profile/MisServicios';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Avatar, Btn, Card, Mono, Pill, Stat } from '@/shared/components/hireeo';
import { ChatMensajes } from '@/shared/components/hireeo/ui/ChatMensajes';

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
    const basicCount = usuario.stats.totalServicios - usuario.stats.premiumCount;
    const tieneBasicos = basicCount > 0;

    const serviceStats = await Promise.all(
        usuario.servicios.map(async (s) => ({
            servicioId: s.id,
            titulo: s.titulo,
            stats: await getServiceStats(s.id),
        })),
    );

    const firstName = usuario.name.split(' ')[0];

    return (
        <>
            {/* ── Welcome Hero Banner ──────────────────────────────────────── */}
            <div
                className="flex flex-wrap items-center justify-between gap-6"
                style={{
                    padding: 28,
                    background:
                        'linear-gradient(135deg, var(--tint) 0%, var(--accent-soft) 100%)',
                    borderBottom: '1px solid var(--line)',
                }}
            >
                <div className="flex items-center gap-4">
                    <Avatar
                        name={usuario.name}
                        src={usuario.avatar ?? undefined}
                        size={64}
                        ring
                    />
                    <div>
                        <h1
                            className="m-0"
                            style={{
                                fontSize: 26,
                                fontWeight: 500,
                                letterSpacing: '-0.025em',
                                color: 'var(--ink)',
                            }}
                        >
                            Hola, {firstName}
                        </h1>
                        <Mono
                            className="mt-1 text-[12px]"
                            style={{ color: 'var(--sub)' }}
                        >
                            {usuario.stats.totalServicios} servicios ·{' '}
                            {usuario.stats.totalCalificaciones} reseñas
                        </Mono>
                    </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    <Btn
                        variant="secondary"
                        icon="user"
                        href={`/${country}/profile/settings`}
                    >
                        Ajustes
                    </Btn>
                    <Btn variant="accent" icon="plus" href={`/${country}/publish`}>
                        Publicar servicio
                    </Btn>
                </div>
            </div>

            <div style={{ padding: 28 }}>
                {/* ── Stats Grid ───────────────────────────────────────────── */}
                <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
                    {/* 4ª card: Servicios Básicos con micro-link "Mejorar" */}
                    <Card padding={20} className="flex flex-col justify-between gap-3">
                        <Stat
                            label="Básicos"
                            value={String(basicCount)}
                            sub="estándar"
                            icon="shieldCheck"
                        />
                        {tieneBasicos ? (
                            <Btn
                                variant="ghost"
                                size="sm"
                                iconRight="sparkle"
                                href={`/${country}/pricing`}
                                className="self-start text-accent"
                            >
                                Mejorar
                            </Btn>
                        ) : null}
                    </Card>
                </div>

                {/* ── Mis servicios ────────────────────────────────────────── */}
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
                        <Btn variant="secondary" size="sm" icon="plus" href={`/${country}/publish`}>
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

                {/* ── Estadísticas por servicio ─────────────────────────────── */}
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

                {/* ── Upsell Banner (solo con servicios básicos) ───────────── */}
                {tieneBasicos ? (
                    <div
                        className="relative grid items-center gap-8 overflow-hidden"
                        style={{
                            padding: 28,
                            borderRadius: '2rem',
                            background: '#0A0A0A',
                            color: 'white',
                            gridTemplateColumns: '1.2fr 1fr',
                        }}
                    >
                        {/* Glow radial */}
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
                                Destaca tus servicios y{' '}
                                <span style={{ color: 'var(--accent-bright)' }}>
                                    aparece primero.
                                </span>
                            </h3>
                            <p
                                className="m-0 mb-5 max-w-md text-[14px]"
                                style={{ color: 'rgba(255,255,255,0.7)' }}
                            >
                                Pro te permite destacar servicios, recibir alertas instantáneas y
                                aparecer primero en las búsquedas de tu zona.
                            </p>
                            <Link
                                href={`/${country}/pricing`}
                                className="inline-flex items-center gap-1.5 rounded-md bg-white px-5 py-2.5 text-[13px] font-semibold"
                                style={{ color: '#0a0a0a' }}
                            >
                                Ver planes Pro →
                            </Link>
                        </div>
                        {/* Mini-grid glassmorphism de beneficios */}
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
            <ChatMensajes />
        </>
    );
}
