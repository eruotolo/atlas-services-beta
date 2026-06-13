'use client';

import Link from 'next/link';
import type { ReactElement } from 'react';

import { toggleFavorito } from '@/features/favorites/actions/mutations';
import FavoriteButton from '@/features/favorites/components/FavoriteButton';
import type { Dictionary } from '@/lib/i18n/types';
import { Icon } from '@/shared/components/hireeo';
import ShareButton from '@/shared/components/ui/ShareButton';

interface ServiceSubNavProps {
    dict: Dictionary;
    country: string;
    countryName: string;
    regionName: string | null;
    localityName: string | null;
    category: string;
    professionalName: string;
    serviceId: string;
    serviceSlug: string;
    serviceTitle: string;
    serviceDescription: string;
    initialIsFavorite: boolean;
}

export function ServiceSubNav({
    dict,
    country,
    countryName,
    regionName,
    localityName,
    category,
    professionalName,
    serviceId,
    serviceSlug,
    serviceTitle,
    serviceDescription,
    initialIsFavorite,
}: ServiceSubNavProps): ReactElement {
    const breadcrumbPlace = [countryName, regionName, localityName].filter(Boolean).join(' · ');

    return (
        <div
            className="border-b border-line bg-bg"
        >
            <div className="mx-auto flex max-w-site flex-col gap-3 px-6 py-3.5 sm:px-10 lg:px-14 md:flex-row md:items-center md:justify-between">
                <nav
                    className="flex flex-wrap items-center gap-1.5 text-[12px] text-sub"
                    aria-label="breadcrumb"
                    
                >
                    <Link href={`/${country}`}>{dict.search.breadcrumbHome}</Link>
                    <Icon name="chevronRight" size={10} stroke="var(--muted)" />
                    <span>{breadcrumbPlace}</span>
                    <Icon name="chevronRight" size={10} stroke="var(--muted)" />
                    <Link href={`/${country}/search?c=${encodeURIComponent(category)}`}>
                        {category}
                    </Link>
                    <Icon name="chevronRight" size={10} stroke="var(--muted)" />
                    <span className="font-semibold text-ink">
                        {professionalName}
                    </span>
                </nav>

                <div className="flex items-center gap-1.5">
                    <FavoriteButton
                        serviceId={serviceId}
                        initialIsFavorite={initialIsFavorite}
                        onToggle={toggleFavorito}
                    />
                    <ShareButton
                        title={serviceTitle}
                        text={serviceDescription}
                        url={`/${country}/service/${serviceSlug}`}
                    />
                </div>
            </div>
        </div>
    );
}
