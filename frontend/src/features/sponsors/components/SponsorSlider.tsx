'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { ExternalLink } from 'lucide-react';

interface Sponsor {
    id: string;
    nombre: string;
    imagenUrl: string;
    linkExterno: string;
    descripcion?: string | null;
}

interface SponsorSliderProps {
    sponsors: Sponsor[];
    showDots?: boolean;
    variant?: 'senior' | 'premium';
}

export default function SponsorSlider({
    sponsors,
    showDots = false,
    variant = 'premium',
}: SponsorSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const itemsPerPage = variant === 'premium' ? 2 : 1;
    const totalPages = Math.ceil(sponsors.length / itemsPerPage);

    useEffect(() => {
        if (!sponsors || sponsors.length <= itemsPerPage) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % totalPages);
        }, 5000);

        return () => clearInterval(interval);
    }, [sponsors, totalPages, itemsPerPage]);

    if (!sponsors || sponsors.length === 0) {
        return null;
    }

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    const _nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % totalPages);
    };

    const _prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
    };

    const visibleSponsors = sponsors.slice(
        currentIndex * itemsPerPage,
        currentIndex * itemsPerPage + itemsPerPage,
    );

    return (
        <div className="relative w-full">
            {variant === 'senior' ? (
                <div className="overflow-hidden rounded-[2.5rem] shadow-xl shadow-blue-900/10">
                    <Link
                        href={sponsors[currentIndex].linkExterno}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative block aspect-[21/9] w-full overflow-hidden sm:aspect-[21/7]"
                    >
                        <Image
                            src={sponsors[currentIndex].imagenUrl}
                            alt={sponsors[currentIndex].nombre}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {visibleSponsors.map((sponsor) => (
                        <div
                            key={sponsor.id}
                            className="group overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white p-2 shadow-xl shadow-blue-900/5 transition-all hover:shadow-2xl hover:shadow-blue-900/10"
                        >
                            <div className="flex flex-col items-center sm:flex-row">
                                {/* Imagen */}
                                <div className="relative m-2 h-40 w-full shrink-0 overflow-hidden rounded-[2rem] sm:h-40 sm:w-40">
                                    <Image
                                        src={sponsor.imagenUrl}
                                        alt={sponsor.nombre}
                                        fill
                                        className="object-cover transition-all duration-500 group-hover:scale-110"
                                    />
                                </div>

                                {/* Contenido */}
                                <div className="flex flex-grow flex-col justify-center p-4">
                                    <span className="mb-2 inline-block w-fit rounded bg-blue-50 px-2 py-0.5 text-[10px] font-black text-blue-600">
                                        SPONSORED
                                    </span>
                                    <h3 className="mb-1 line-clamp-1 text-base font-black text-gray-900">
                                        {sponsor.nombre}
                                    </h3>
                                    {sponsor.descripcion && (
                                        <p className="mb-3 line-clamp-2 text-[11px] leading-relaxed text-gray-500">
                                            {sponsor.descripcion}
                                        </p>
                                    )}
                                    <Link
                                        href={sponsor.linkExterno}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:underline"
                                    >
                                        Visitar sitio <ExternalLink size={12} />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Dots */}
            {showDots && totalPages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                    {Array.from({ length: totalPages }).map((_, index) => {
                        return (
                            <button
                                // biome-ignore lint/suspicious/noArrayIndexKey: Index usado para navegación
                                key={index}
                                type="button"
                                onClick={() => goToSlide(index)}
                                className={`h-2 cursor-pointer rounded-full transition-all ${
                                    index === currentIndex
                                        ? 'w-10 bg-blue-600'
                                        : 'w-2 bg-gray-300 hover:bg-gray-400'
                                }`}
                                aria-label={`Ir a página ${index + 1}`}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}
