import Link from 'next/link';
import { redirect } from 'next/navigation';

import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';

import { getMisFavoritos } from '@/features/favorites/actions/queries';
import { PageHeader } from '@/features/users/components/account/PageHeader';
import { UserShell } from '@/features/users/components/account/UserShell';
import { getProfilePageData } from '@/features/users/actions';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Btn, Card, Icon, Mono, Pill, Stars } from '@/shared/components/hireeo';

export const metadata: Metadata = {
    title: 'Mis Favoritos — Hireeo',
    description: 'Servicios que has guardado como favoritos.',
};

type Props = { params: Promise<{ country: string }> };

export default async function FavoritosPage({ params }: Props) {
    const { country } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect(`/${country}/login`);
    }

    const [usuario, favoritos] = await Promise.all([
        getProfilePageData(session.user.id),
        getMisFavoritos(),
    ]);

    if (!usuario) {
        redirect(`/${country}/login`);
    }

    const tienePremium = usuario.stats.premiumCount > 0;

    return (
        <UserShell
            country={country}
            user={{ name: usuario.name, avatar: usuario.avatar, isPremium: tienePremium }}
        >
            <PageHeader
                breadcrumb={['Mi cuenta', 'Favoritos']}
                title="Servicios guardados"
                subtitle={
                    favoritos.length === 0
                        ? 'Aún no has guardado ningún servicio.'
                        : `Tienes ${favoritos.length} ${favoritos.length === 1 ? 'servicio guardado' : 'servicios guardados'} para contactar después.`
                }
                actions={
                    <Btn variant="secondary" icon="search" href={`/${country}/buscar`}>
                        Explorar servicios
                    </Btn>
                }
            />

            <div style={{ padding: 28 }}>
                {favoritos.length === 0 ? (
                    <Card padding={48} className="text-center">
                        <div
                            className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full"
                            style={{ background: 'var(--tint)' }}
                        >
                            <Icon name="heart" size={20} stroke="var(--muted)" />
                        </div>
                        <h3
                            className="m-0 mb-2"
                            style={{
                                fontSize: 18,
                                fontWeight: 500,
                                letterSpacing: '-0.015em',
                                color: 'var(--ink)',
                            }}
                        >
                            Sin favoritos por ahora
                        </h3>
                        <p
                            className="m-0 mx-auto max-w-sm text-[13px]"
                            style={{ color: 'var(--sub)' }}
                        >
                            Explora servicios y toca el corazón para guardarlos aquí.
                        </p>
                        <div className="mt-5">
                            <Btn icon="search" href={`/${country}/buscar`}>
                                Buscar servicios
                            </Btn>
                        </div>
                    </Card>
                ) : (
                    <div
                        className="grid gap-4"
                        style={{
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        }}
                    >
                        {favoritos.map((fav) => (
                            <Link
                                key={fav.id}
                                href={`/${country}/servicio/${fav.service.slug}`}
                                className="group flex flex-col overflow-hidden rounded-xl border bg-bg transition-shadow hover:shadow-md"
                                style={{ borderColor: 'var(--line)' }}
                            >
                                <div
                                    className="relative overflow-hidden"
                                    style={{
                                        aspectRatio: '16 / 10',
                                        background: 'var(--tint)',
                                    }}
                                >
                                    {/* biome-ignore lint/performance/noImgElement: imagen externa servida desde URL del backend */}
                                    <img
                                        src={fav.service.image}
                                        alt={fav.service.title}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    {fav.service.isPremium ? (
                                        <div className="absolute top-3 left-3">
                                            <Pill tone="warning" icon="crown">
                                                Premium
                                            </Pill>
                                        </div>
                                    ) : null}
                                </div>
                                <div className="flex flex-1 flex-col p-4">
                                    <Mono
                                        className="mb-1.5 text-[10.5px] font-semibold"
                                        style={{
                                            color: 'var(--accent)',
                                            letterSpacing: '0.08em',
                                        }}
                                    >
                                        {fav.service.category.toUpperCase()}
                                    </Mono>
                                    <h3
                                        className="m-0 line-clamp-2 text-[14px] font-semibold"
                                        style={{
                                            letterSpacing: '-0.01em',
                                            color: 'var(--ink)',
                                        }}
                                    >
                                        {fav.service.title}
                                    </h3>
                                    <div
                                        className="mt-3 flex items-center gap-3 text-[12px]"
                                        style={{ color: 'var(--sub)' }}
                                    >
                                        <Stars
                                            rating={fav.service.rating}
                                            count={fav.service.reviewsCount}
                                            size={11}
                                        />
                                        <span className="inline-flex items-center gap-1">
                                            <Icon
                                                name="pin"
                                                size={11}
                                                stroke="var(--accent)"
                                            />
                                            {fav.service.comuna}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </UserShell>
    );
}
