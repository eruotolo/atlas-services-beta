import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { ChevronRight, Crown, Settings, ShieldCheck, Zap } from 'lucide-react';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';

import { getCategorias } from '@/features/categories/actions';
import { getProfilePageData } from '@/features/users/actions';
import LogoutButton from '@/features/users/components/profile/LogoutButton';
import MisServicios from '@/features/users/components/profile/MisServicios';

import { getServiceStats } from '@/features/analytics/actions';
import ProviderStatsCard from '@/features/analytics/components/provider/ProviderStatsCard';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';

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

    // Fetch interaction stats for each service in parallel
    const serviceStats = await Promise.all(
        usuario.servicios.map(async (s) => ({
            servicioId: s.id,
            titulo: s.titulo,
            stats: await getServiceStats(s.id),
        })),
    );

    return (
        <section className="bg-background min-h-screen py-12 transition-colors duration-300">
            <div className="container mx-auto max-w-7xl px-4">
                <div className="flex flex-col gap-8 md:flex-row">
                    {/* Left Side: Profile Info */}
                    <aside className="space-y-6 md:w-80 md:shrink-0">
                        <div className="rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-gray-900/40 dark:shadow-none dark:backdrop-blur-xl">
                            <div className="relative mx-auto mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-blue-600 text-3xl font-bold text-white shadow-lg dark:border-gray-800">
                                {usuario.avatar ? (
                                    <Image
                                        src={usuario.avatar}
                                        alt={usuario.name}
                                        fill
                                        sizes="96px"
                                        className="object-cover"
                                    />
                                ) : (
                                    usuario.name.charAt(0).toUpperCase()
                                )}
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {usuario.name}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {usuario.email}
                            </p>
                            {usuario.phone && (
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    {usuario.phone}
                                </p>
                            )}
                            <div className="mt-4 inline-block rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[10px] font-bold tracking-wider text-blue-700 uppercase dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-blue-400">
                                {tienePremium ? 'Proveedor Premium' : 'Proveedor Verificado'}
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900/40 dark:shadow-none">
                            <h3 className="mb-4 text-sm font-bold text-gray-900 dark:text-white">
                                Estadísticas
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Servicios publicados
                                    </span>
                                    <span className="min-w-[3rem] rounded-xl bg-blue-50 px-3 py-1 text-center text-sm font-black text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                        {usuario.stats.totalServicios}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Reseñas recibidas
                                    </span>
                                    <span className="min-w-[3rem] rounded-xl bg-blue-50 px-3 py-1 text-center text-sm font-black text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                        {usuario.stats.totalCalificaciones}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Servicios Premium
                                    </span>
                                    <span
                                        className={`min-w-[3rem] rounded-xl px-3 py-1 text-center text-sm font-black ${
                                            tienePremium
                                                ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
                                                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-500'
                                        }`}
                                    >
                                        {usuario.stats.premiumCount}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <nav className="space-y-1 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-gray-900/40 dark:shadow-none">
                            <Link
                                href={`/${country}/perfil/ajustes`}
                                className="flex w-full items-center justify-between rounded-xl p-3 text-gray-600 transition-all hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                                <div className="flex items-center gap-3">
                                    <Settings size={18} />
                                    <span className="text-sm font-medium">Ajustes de Perfil</span>
                                </div>
                                <ChevronRight
                                    size={14}
                                    className="text-gray-300 dark:text-gray-600"
                                />
                            </Link>
                            <LogoutButton />
                        </nav>

                        {tienePremium && (
                            <div className="rounded-3xl border border-amber-100 bg-amber-50 p-6 dark:border-amber-900/20 dark:bg-amber-900/10">
                                <div className="mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-400">
                                    <Crown size={20} />
                                    <span className="text-sm font-bold">Plan Premium Activo</span>
                                </div>
                                <p className="text-xs leading-relaxed text-amber-600 dark:text-amber-500">
                                    Tienes acceso a todas las funcionalidades premium de la
                                    plataforma.
                                </p>
                            </div>
                        )}
                    </aside>

                    {/* Right Side: Main Content */}
                    <div className="min-w-0 flex-grow space-y-8">
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

                        {/* Per-service interaction stats */}
                        {serviceStats.length > 0 && (
                            <div>
                                <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
                                    📊 Estadísticas por Servicio
                                </h3>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {serviceStats.map((ss) => (
                                        <ProviderStatsCard
                                            key={ss.servicioId}
                                            servicioTitulo={ss.titulo}
                                            stats={ss.stats}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {!tienePremium && (
                            <div className="relative overflow-hidden rounded-[2.5rem] bg-blue-600 p-10 text-white shadow-2xl shadow-blue-900/20 dark:shadow-none">
                                <div className="absolute top-0 right-0 p-10 opacity-10">
                                    <Zap size={140} />
                                </div>
                                <div className="relative z-10 max-w-lg">
                                    <h3 className="mb-4 text-2xl font-black italic">
                                        ¿Por qué destacar un servicio?
                                    </h3>
                                    <ul className="mb-8 space-y-3">
                                        <li className="flex items-center gap-3 text-sm font-medium">
                                            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20">
                                                <Crown size={12} />
                                            </div>
                                            Aparece en los primeros resultados de búsqueda.
                                        </li>
                                        <li className="flex items-center gap-3 text-sm font-medium">
                                            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20">
                                                <ShieldCheck size={12} />
                                            </div>
                                            Obtén el sello de &quot;Destacado&quot; que atrae 5x más
                                            clics.
                                        </li>
                                    </ul>
                                    <Link
                                        href={`/${country}/suscripcion-pro`}
                                        className="inline-block rounded-xl bg-white px-8 py-3 font-bold text-blue-600 shadow-lg transition-all hover:bg-blue-50 dark:bg-gray-100 dark:text-blue-800"
                                    >
                                        Ver planes Premium
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
