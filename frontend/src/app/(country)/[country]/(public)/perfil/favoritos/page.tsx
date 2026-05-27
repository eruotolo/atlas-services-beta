import Link from 'next/link';

import { Heart, MapPin, Star } from 'lucide-react';
import type { Metadata } from 'next';

import { getMisFavoritos } from '@/features/favorites/actions/queries';

export const metadata: Metadata = {
    title: 'Mis Favoritos — Hireeo',
    description: 'Servicios que has guardado como favoritos.',
};

export default async function FavoritosPage({
    params,
}: {
    params: Promise<{ country: string }>;
}) {
    const { country } = await params;
    const favoritos = await getMisFavoritos();

    return (
        <section className="bg-background min-h-screen py-8 md:py-12">
            <div className="container mx-auto max-w-site px-4 sm:px-6 lg:px-8">
                <div className="mb-8 md:mb-10">
                    <h1 className="text-2xl font-black text-gray-900 md:text-3xl dark:text-white">
                        Mis Favoritos
                    </h1>
                    <p className="mt-2 text-sm text-gray-500 md:text-base dark:text-gray-400">
                        Servicios que has guardado para contactar después.
                    </p>
                </div>

                {favoritos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl bg-gray-50 py-16 text-center dark:border dark:border-white/5 dark:bg-gray-900/40">
                        <Heart
                            size={48}
                            className="mb-4 text-gray-300 dark:text-gray-600"
                        />
                        <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">
                            Aún no tienes favoritos
                        </h3>
                        <p className="mt-2 max-w-sm text-sm text-gray-500 dark:text-gray-400">
                            Explora servicios y guarda los que más te interesen haciendo clic en el
                            ícono de corazón.
                        </p>
                        <Link
                            href={`/${country}/buscar`}
                            className="mt-6 rounded-xl bg-brand px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-hover dark:bg-brand-light dark:text-gray-900 dark:hover:bg-brand"
                        >
                            Explorar Servicios
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {favoritos.map((fav) => (
                            <Link
                                key={fav.id}
                                href={`/${country}/servicio/${fav.service.slug}`}
                                className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-gray-900/40 dark:hover:border-white/20"
                            >
                                <div className="relative aspect-[16/10] overflow-hidden bg-gray-100 dark:bg-gray-800">
                                    {/* biome-ignore lint/nursery/noImgElement: External URL image */}
                                    <img
                                        src={fav.service.image}
                                        alt={fav.service.title}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    {fav.service.isPremium && (
                                        <span className="absolute top-3 left-3 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 px-2.5 py-1 text-[9px] font-bold tracking-wider text-white uppercase shadow">
                                            Premium
                                        </span>
                                    )}
                                </div>
                                <div className="p-4 md:p-5">
                                    <span className="mb-2 inline-block rounded bg-brand/10 px-2 py-0.5 text-[9px] font-bold tracking-wider text-brand-hover uppercase dark:bg-brand-marino/30 dark:text-brand-light">
                                        {fav.service.category}
                                    </span>
                                    <h3 className="mb-2 text-sm font-bold text-gray-900 capitalize md:text-base dark:text-white">
                                        {fav.service.title}
                                    </h3>
                                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                        <div className="flex items-center gap-1">
                                            <Star
                                                size={12}
                                                fill={fav.service.rating > 0 ? 'currentColor' : 'none'}
                                                className={fav.service.rating > 0 ? 'text-yellow-500' : ''}
                                            />
                                            <span>
                                                {fav.service.rating > 0
                                                    ? fav.service.rating.toFixed(1)
                                                    : '—'}
                                            </span>
                                            <span>({fav.service.reviewsCount})</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <MapPin size={12} className="text-brand" />
                                            <span>{fav.service.comuna}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
