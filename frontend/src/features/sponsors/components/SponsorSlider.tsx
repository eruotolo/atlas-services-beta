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
                <div className="overflow-hidden rounded-[2.5rem] shadow-xl shadow-brand-marino/10">
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
                            className="group overflow-hidden rounded-[2.5rem] border border-line bg-bg p-2 shadow-xl shadow-brand-marino/5 transition-all hover:shadow-2xl hover:shadow-brand-marino/10"
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
                                    <span className="mb-2 inline-block w-fit rounded bg-brand/5 px-2 py-0.5 text-[10px] font-black text-brand">
                                        SPONSORED
                                    </span>
                                    <h3 className="mb-1 line-clamp-1 text-base font-black text-ink">
                                        {sponsor.nombre}
                                    </h3>
                                    {sponsor.descripcion && (
                                        <p className="mb-3 line-clamp-2 text-[11px] leading-relaxed text-muted">
                                            {sponsor.descripcion}
                                        </p>
                                    )}
                                    <Link
                                        href={sponsor.linkExterno}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-xs font-bold text-brand hover:underline"
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
                                        ? 'w-10 bg-brand'
                                        : 'w-2 bg-line hover:bg-muted'
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
