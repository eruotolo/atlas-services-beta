'use client';

import { useState } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { MapPin, Search } from 'lucide-react';

const bgHeroHome = '/bg-chiloe-01.png';

export default function HomeHeroSection() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('Todo Chiloé');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.push(`/buscar?q=${searchTerm}`);
    };

    return (
        <section className="bg-background w-full pt-[50px] pb-[100px]">
            <div className="container mx-auto max-w-7xl px-4">
                <div className="w-full">
                    <div className="relative flex min-h-[540px] flex-col items-center justify-center gap-8 overflow-hidden rounded-[2rem] p-8 shadow-2xl transition-transform">
                        {/* SEO Optimized Background Image */}
                        <Image
                            src={bgHeroHome}
                            alt="Servicios profesionales y oficios en Chiloé - Paisaje local"
                            fill
                            priority
                            sizes="100vw"
                            quality={80}
                            className="z-0 object-cover"
                        />
                        {/* Dark Overlay for Readability */}
                        <div className="absolute inset-0 z-0 bg-black/40 dark:bg-black/60" />

                        <div className="relative z-10 flex max-w-3xl flex-col gap-4 text-center">
                            <h1 className="text-4xl leading-[1.1] font-black tracking-tight text-white drop-shadow-lg md:text-6xl">
                                Soluciones rápidas para tu hogar en Chiloé
                            </h1>
                            <p className="text-base leading-relaxed font-medium text-blue-50 opacity-90 md:text-xl">
                                Encuentra expertos locales verificados en Castro, Ancud, Quellón y
                                alrededores.
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
                                        placeholder="¿Qué necesitas reparar hoy?"
                                        className="w-full border-none bg-transparent text-gray-700 outline-none placeholder:text-gray-500 focus:ring-0 dark:text-white"
                                    />
                                </div>

                                <div className="flex items-center gap-2 border-t border-gray-100 px-4 py-3 md:border-t-0 md:border-l dark:border-white/10">
                                    <MapPin className="text-blue-600" size={18} />
                                    <select
                                        aria-label="Seleccionar ubicación"
                                        value={selectedLocation}
                                        onChange={(e) => setSelectedLocation(e.target.value)}
                                        className="border-none bg-transparent text-sm font-medium text-gray-700 outline-none focus:ring-0 dark:text-white"
                                    >
                                        <option className="dark:bg-gray-900">Todo Chiloé</option>
                                        <option className="dark:bg-gray-900">Castro</option>
                                        <option className="dark:bg-gray-900">Ancud</option>
                                        <option className="dark:bg-gray-900">Quellón</option>
                                        <option className="dark:bg-gray-900">Dalcahue</option>
                                        <option className="dark:bg-gray-900">Chonchi</option>
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    className="m-1 cursor-pointer rounded-xl bg-blue-600 px-8 py-3 font-bold text-white transition-all hover:bg-blue-700"
                                >
                                    Buscar
                                </button>
                            </form>
                            <p className="mb-6 text-sm text-white/80 drop-shadow-md">
                                <span className="font-medium">Popular:</span> Electricista,
                                Gasfiter, Carpintero
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
