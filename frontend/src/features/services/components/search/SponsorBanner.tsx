'use client';

import Image from 'next/image';
import type { ReactElement } from 'react';

import type { Dictionary } from '@/lib/i18n/types';
import { Btn, Mono } from '@/shared/components/hireeo';

export interface SearchSponsor {
    id: string;
    nombre: string;
    imagenUrl: string;
    linkExterno: string;
    descripcion?: string | null;
}

interface SponsorBannerProps {
    sponsor: SearchSponsor;
    dict: Dictionary;
}

function initialsOf(name: string): string {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((p) => p.charAt(0).toUpperCase())
        .join('') || '?';
}

export function SponsorBanner({ sponsor, dict }: SponsorBannerProps): ReactElement {
    return (
        <a
            href={sponsor.linkExterno}
            target="_blank"
            rel="sponsored noopener"
            className="relative mb-3 block rounded-xl border bg-bg p-[18px] transition-shadow hover:shadow-sm"
            style={{ borderColor: 'var(--line)' }}
        >
            <Mono
                className="absolute top-3 right-3 rounded px-1.5 py-0.5 text-[10px] font-semibold"
                style={{
                    background: 'var(--tint)',
                    color: 'var(--muted)',
                    letterSpacing: '0.08em',
                }}
            >
                {dict.search.sponsorLabel}
            </Mono>

            <div className="flex items-center gap-3.5">
                {sponsor.imagenUrl ? (
                    <Image
                        src={sponsor.imagenUrl}
                        alt={sponsor.nombre}
                        width={56}
                        height={56}
                        className="h-14 w-14 shrink-0 rounded-[10px] object-cover"
                    />
                ) : (
                    <div
                        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[10px] text-[22px] font-bold text-white"
                        style={{ background: 'var(--accent)' }}
                    >
                        {initialsOf(sponsor.nombre)}
                    </div>
                )}
                <div className="min-w-0 flex-1">
                    <div
                        className="truncate text-[14.5px] font-semibold"
                        style={{ color: 'var(--ink)' }}
                    >
                        {sponsor.nombre}
                    </div>
                    {sponsor.descripcion ? (
                        <div
                            className="mt-0.5 line-clamp-1 text-[12.5px]"
                            style={{ color: 'var(--sub)' }}
                        >
                            {sponsor.descripcion}
                        </div>
                    ) : null}
                </div>
                <Btn variant="secondary" size="sm" iconRight="external">
                    {dict.search.contactCta}
                </Btn>
            </div>
        </a>
    );
}
