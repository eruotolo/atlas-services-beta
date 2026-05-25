'use client';

import { useState } from 'react';

import Image from 'next/image';

import { CheckCircle, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface ImageGalleryProps {
    imagenPrincipal: string | null;
    imagenes: string[];
    title: string;
    isPremium?: boolean;
}

export default function ImageGallery({
    imagenPrincipal,
    imagenes,
    title,
    isPremium = false,
}: ImageGalleryProps) {
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Construir array completo de imágenes: primero la principal, luego la galería
    const allImages = [...(imagenPrincipal ? [imagenPrincipal] : []), ...imagenes].filter(Boolean);

    const hasMultipleImages = allImages.length > 1;

    const openLightbox = (index: number) => {
        setCurrentIndex(index);
        setIsLightboxOpen(true);
    };

    const closeLightbox = () => {
        setIsLightboxOpen(false);
    };

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
    };

    // Si no hay imágenes, mostrar placeholder
    if (allImages.length === 0) {
        return (
            <div className="relative aspect-video overflow-hidden rounded-3xl bg-gray-100 shadow-2xl shadow-brand-marino/5 md:aspect-[16/9] dark:bg-gray-800 dark:shadow-none">
                <div className="flex h-full items-center justify-center">
                    <p className="text-gray-400 dark:text-gray-500">Sin imagen disponible</p>
                </div>
            </div>
        );
    }

    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openLightbox(index);
        }
    };

    return (
        <>
            {/* Main Image */}
            <button
                type="button"
                className="relative block aspect-video w-full cursor-pointer overflow-hidden rounded-3xl border-none p-0 shadow-2xl shadow-brand-marino/5 md:aspect-[16/9] dark:border dark:border-white/5 dark:shadow-none"
                onClick={() => openLightbox(0)}
                onKeyDown={(e) => handleKeyDown(e, 0)}
            >
                <Image
                    src={allImages[0]}
                    alt={title}
                    fill
                    sizes="(max-width: 768px) 100vw, 800px"
                    className="object-cover transition-transform hover:scale-105"
                />
                {isPremium && (
                    <div className="absolute top-4 left-4 flex items-center gap-1 rounded-xl bg-brand px-3 py-1.5 text-xs font-bold tracking-wider text-white uppercase shadow-lg">
                        <CheckCircle size={14} />
                        Destacado
                    </div>
                )}
                {hasMultipleImages && (
                    <div className="absolute right-4 bottom-4 rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white">
                        {allImages.length} fotos
                    </div>
                )}
            </button>

            {/* Thumbnail Gallery */}
            {hasMultipleImages && (
                <div className="grid grid-cols-4 gap-4">
                    {allImages.slice(1, 5).map((image, index) => (
                        <button
                            key={image}
                            type="button"
                            className="relative block aspect-video w-full cursor-pointer overflow-hidden rounded-xl border-none p-0"
                            onClick={() => openLightbox(index + 1)}
                            onKeyDown={(e) => handleKeyDown(e, index + 1)}
                        >
                            <Image
                                src={image}
                                alt={`${title} - imagen ${index + 2}`}
                                fill
                                sizes="(max-width: 768px) 25vw, 300px"
                                className="object-cover transition-transform hover:scale-110"
                            />
                            {index === 3 && allImages.length > 5 && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                                    <span className="text-lg font-bold text-white">
                                        +{allImages.length - 5}
                                    </span>
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* Lightbox Modal */}
            {isLightboxOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95">
                    {/* Close Button */}
                    <button
                        type="button"
                        onClick={closeLightbox}
                        className="absolute top-4 right-4 z-10 cursor-pointer rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                    >
                        <X size={24} />
                    </button>

                    {/* Previous Button */}
                    {hasMultipleImages && (
                        <button
                            type="button"
                            onClick={goToPrevious}
                            className="absolute top-1/2 left-4 z-10 -translate-y-1/2 cursor-pointer rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
                        >
                            <ChevronLeft size={32} />
                        </button>
                    )}

                    {/* Image */}
                    <div className="relative h-full w-full max-w-7xl p-12">
                        <Image
                            src={allImages[currentIndex]}
                            alt={`${title} - imagen ${currentIndex + 1}`}
                            fill
                            sizes="100vw"
                            className="object-contain"
                        />
                    </div>

                    {/* Next Button */}
                    {hasMultipleImages && (
                        <button
                            type="button"
                            onClick={goToNext}
                            className="absolute top-1/2 right-4 z-10 -translate-y-1/2 cursor-pointer rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
                        >
                            <ChevronRight size={32} />
                        </button>
                    )}

                    {/* Counter */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white">
                        {currentIndex + 1} / {allImages.length}
                    </div>
                </div>
            )}
        </>
    );
}
