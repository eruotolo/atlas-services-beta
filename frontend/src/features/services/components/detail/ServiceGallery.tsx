import Image from 'next/image';
import type { ReactElement } from 'react';

import type { Dictionary } from '@/lib/i18n/types';
import { Icon } from '@/shared/components/hireeo';

interface ServiceGalleryProps {
    dict: Dictionary;
    mainImage: string | null;
    images: string[];
    title: string;
}

const PLACEHOLDER_GRADIENTS = [
    'linear-gradient(135deg, #2D4E8F, #6FA0E0)',
    'linear-gradient(135deg, #1A4A6A, #4A8FAA)',
    'linear-gradient(135deg, #4D5560, #8B97A8)',
    'linear-gradient(135deg, #6B4226, #B07A47)',
    'linear-gradient(135deg, #2A4B5C, #5F7E96)',
] as const;

interface GalleryCell {
    type: 'image' | 'placeholder';
    src: string | null;
    gradient: string;
    isPrimary: boolean;
    extraCount: number;
}

function buildCells(mainImage: string | null, images: string[]): GalleryCell[] {
    const all: Array<string | null> = [mainImage, ...images].filter(
        (v, i) => v !== null || i === 0,
    );
    const visible = all.slice(0, 5);
    const remaining = Math.max(0, all.length - 5);

    return PLACEHOLDER_GRADIENTS.map((gradient, i) => ({
        type: visible[i] ? 'image' : 'placeholder',
        src: visible[i] ?? null,
        gradient,
        isPrimary: i === 0,
        extraCount: i === 4 ? remaining : 0,
    }));
}

export function ServiceGallery({
    dict,
    mainImage,
    images,
    title,
}: ServiceGalleryProps): ReactElement {
    const cells = buildCells(mainImage, images);

    return (
        <div
            className="mb-7 grid gap-1.5"
            style={{
                gridTemplateColumns: '2fr 1fr 1fr',
                gridTemplateRows: 'repeat(2, 140px)',
            }}
        >
            {cells.map((cell, i) => (
                <div
                    key={`cell-${cell.gradient}`}
                    className="relative overflow-hidden rounded-[10px]"
                    style={{
                        gridRow: cell.isPrimary ? 'span 2' : undefined,
                        background: cell.src ? 'transparent' : cell.gradient,
                    }}
                >
                    {cell.src ? (
                        <Image
                            src={cell.src}
                            alt={`${title} — ${i + 1}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 50vw, 33vw"
                        />
                    ) : null}
                    {cell.extraCount > 0 ? (
                        <div
                            className="absolute inset-0 flex items-center justify-center text-[14px] font-semibold text-white"
                            style={{ background: 'rgba(0,0,0,0.5)' }}
                        >
                            <span className="inline-flex items-center gap-1.5">
                                <Icon name="eye" size={14} stroke="white" />
                                {dict.serviceDetail.galleryMore.replace(
                                    '{n}',
                                    cell.extraCount.toString(),
                                )}
                            </span>
                        </div>
                    ) : null}
                </div>
            ))}
        </div>
    );
}
