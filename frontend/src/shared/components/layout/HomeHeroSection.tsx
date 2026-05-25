'use client';

import { useState } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { MapPin, Search } from 'lucide-react';

import { t } from '@/lib/i18n/interpolate';
import { useDictionary } from '@/lib/i18n/useDictionary';
import { useRotatingText } from '@/shared/hooks/useRotatingText';

import type { GeoRegion } from '@/features/geo/types/geoTypes';

const bgHeroHome = '/bg-chiloe-01.png'; // TODO(F1.1): rename image file to atlas-hero.png

interface HomeHeroSectionProps {
    country: string;
    countryName: string;
    regions: GeoRegion[];
}

export default function HomeHeroSection({ country, countryName, regions }: HomeHeroSectionProps) {
    const router = useRouter();
    const dict = useDictionary();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRegion, setSelectedRegion] = useState('');

    const rotatingWords = ['electricista', 'gasfíter', 'carpintero', 'pintor', 'maestro'];
    const { currentWord, className: wordClass } = useRotatingText(rotatingWords, 2800);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (searchTerm) params.set('q', searchTerm);
        if (selectedRegion) params.set('region', selectedRegion);
        router.push(`/${country}/buscar?${params.toString()}`);
    };

    return (
        <section className="bg-background w-full pt-[50px] pb-[100px]">
            <div className="container mx-auto max-w-site px-4">
                <div className="w-full">
                    <div className="relative flex min-h-[540px] flex-col items-center justify-center gap-8 overflow-hidden rounded-[2rem] p-8 shadow-2xl transition-transform">
                        <Image
                            src={bgHeroHome}
                            alt={`${dict.home.heroTitle} ${countryName}`}
                            fill
                            priority
                            sizes="100vw"
                            quality={80}
                            className="z-0 object-cover"
                        />
                        <div className="absolute inset-0 z-0 bg-black/40 dark:bg-black/60" />

                        <div className="relative z-10 flex max-w-3xl flex-col gap-4 text-center">
                            <h1 className="text-4xl leading-[1.1] font-black tracking-tight text-white drop-shadow-lg md:text-6xl">
                                Encuentra tu{' '}
                                <span key={currentWord} className={`inline-block text-brand-cyan ${wordClass}`}>
                                    {currentWord}
                                </span>
                                <br />
                                ideal
                            </h1>
                            <p className="text-base leading-relaxed font-medium text-white/90 opacity-90 md:text-xl">
                                {t(dict.home.heroSubtitle, { countryName })}
                            </p>
                        </div>

                        <div className="relative z-10 flex w-full max-w-[700px] flex-col">
                            <form
                                onSubmit={handleSearch}
                                className="mb-4 flex flex-col items-stretch overflow-hidden rounded-2xl bg-white p-2 shadow-2xl md:flex-row md:items-center dark:border dark:border-white/10 dark:bg-gray-950/80 dark:backdrop-blur-xl"
                            >
                                <div className="flex flex-grow items-center gap-3 px-4 py-3">
                                    <Search className="text-gray-500" size={20} />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder={dict.home.searchPlaceholder}
                                        className="w-full border-none bg-transparent text-gray-700 outline-none placeholder:text-gray-500 focus:ring-0 dark:text-white"
                                    />
                                </div>

                                <div className="flex items-center gap-2 border-t border-gray-100 px-4 py-3 md:border-t-0 md:border-l dark:border-white/10">
                                    <MapPin className="text-brand" size={18} />
                                    <select
                                        aria-label={dict.home.heroAriaRegion}
                                        value={selectedRegion}
                                        onChange={(e) => setSelectedRegion(e.target.value)}
                                        className="border-none bg-transparent text-sm font-medium text-gray-700 outline-none focus:ring-0 dark:text-white"
                                    >
                                        <option value="" className="dark:bg-gray-900">
                                            {t(dict.home.heroAllCountry, { countryName })}
                                        </option>
                                        {regions.map((r) => (
                                            <option
                                                key={r.id}
                                                value={r.code}
                                                className="dark:bg-gray-900"
                                            >
                                                {r.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    className="btn-primary m-1 cursor-pointer rounded-xl px-8 py-3"
                                >
                                    {dict.home.searchButton}
                                </button>
                            </form>
                            <p className="mb-6 text-sm text-white/80 drop-shadow-md">
                                <span className="font-medium">{dict.home.popularLabel}:</span>{' '}
                                {dict.home.popularItems}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
