'use client';

import type { ChangeEvent, ReactElement } from 'react';

import type { GeoLocality, GeoRegion } from '@/features/geo/types/geoTypes';
import { COUNTRY_SEO_CONFIG } from '@/features/geo/lib/countryUtils';
import { buildSearchTitle, parseCategoryParam } from '@/features/services/lib/searchTitle';
import type { Dictionary } from '@/lib/i18n/types';
import { Icon, Mono, Pill } from '@/shared/components/hireeo';
import { AnimatedRotatingText } from '@/shared/components/hireeo/ui/AnimatedRotatingText';

import type { SortOption } from './types';

interface ActiveChip {
    key: string;
    label: string;
    onRemove: () => void;
}

interface ResultsHeaderProps {
    dict: Dictionary;
    country: string;
    selectedRegion: string;
    regions: GeoRegion[];
    selectedLocality: string;
    localities: GeoLocality[];
    selectedCategory: string;
    totalCount: number;
    activeChips: ActiveChip[];
    sort: SortOption;
    onSortChange: (sort: SortOption) => void;
    onOpenMobileFilters: () => void;
}

function regionName(code: string, regions: GeoRegion[]): string | null {
    return regions.find((r) => r.code === code)?.name ?? null;
}

function localityName(slug: string, localities: GeoLocality[]): string | null {
    return localities.find((l) => l.slug === slug)?.name ?? null;
}

const PAGE_SIZE = 12;

export function ResultsHeader({
    dict,
    country,
    selectedRegion,
    regions,
    selectedLocality,
    localities,
    selectedCategory,
    totalCount,
    activeChips,
    sort,
    onSortChange,
    onOpenMobileFilters,
}: ResultsHeaderProps): ReactElement {
    const countryName = COUNTRY_SEO_CONFIG[country]?.countryName ?? country.toUpperCase();
    const region = selectedRegion ? regionName(selectedRegion, regions) : null;
    const locality = selectedLocality ? localityName(selectedLocality, localities) : null;
    const title = buildSearchTitle({
        categoryNames: parseCategoryParam(selectedCategory),
        localityName: locality,
        regionName: region,
        countryName,
        defaultTitle: dict.search.defaultTitle,
        prepositionIn: dict.search.prepositionIn,
        multipleCategoriesSuffix: dict.search.multipleCategoriesSuffix,
    });
    const shown = totalCount > 0 ? Math.min(totalCount, PAGE_SIZE) : 0;

    function handleSort(e: ChangeEvent<HTMLSelectElement>): void {
        onSortChange(e.target.value as SortOption);
    }

    return (
        <section className="mx-auto max-w-site px-6 pt-6 sm:px-10 lg:px-14">
            <nav
                className="mb-2 flex items-center gap-1.5 text-[12px] text-sub"
                aria-label="breadcrumb"
                
            >
                <span>{dict.search.breadcrumbHome}</span>
                <Icon name="chevronRight" size={10} stroke="var(--muted)" />
                <span>{countryName}</span>
                {region ? (
                    <>
                        <Icon name="chevronRight" size={10} stroke="var(--muted)" />
                        <span>{region}</span>
                    </>
                ) : null}
                <Icon name="chevronRight" size={10} stroke="var(--muted)" />
                <span className="font-semibold text-ink">
                    {title}
                </span>
            </nav>

            <div
                className="flex flex-col gap-4 border-b pb-4 md:flex-row md:items-end md:justify-between border-line"
            >
                <div>
                    <h1
                        className="m-0 text-[28px] md:text-[32px] font-medium text-ink"
                        style={{
                            letterSpacing: '-0.025em'}} 
                    >
                        <AnimatedRotatingText
                            delay={200}
                            speed={40}
                            segments={[{ text: title }]}
                        />
                    </h1>
                    <div className="mt-1.5 text-[13px] text-sub">
                        <Mono className="font-semibold text-ink">
                            {totalCount}
                        </Mono>{' '}
                        {dict.search.professionalsFound}
                        {shown > 0 ? (
                            <>
                                {' — '}
                                {dict.search.showingPrefix}{' '}
                                <Mono className="font-semibold text-ink">
                                    {shown}
                                </Mono>{' '}
                                {dict.search.topRatedHint}
                            </>
                        ) : null}
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {activeChips.length > 0 ? (
                        <Pill tone="outline" icon="filter">
                            {activeChips.length} {dict.search.filtersActive}
                        </Pill>
                    ) : null}

                    <div
                        className="inline-flex items-center gap-0 rounded-md p-[3px] bg-tint"
                    >
                        <button
                            type="button"
                            className="inline-flex items-center gap-1.5 rounded-[5px] px-3 py-1 text-[12px] font-semibold bg-ink text-bg"
                        >
                            <Icon name="layoutDash" size={11} stroke="var(--bg)" />
                            {dict.search.viewList}
                        </button>
                        <button
                            type="button"
                            disabled
                            className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-[5px] px-3 py-1 text-[12px] font-medium opacity-60 text-sub"
                            title={dict.search.mapComingSoon}
                        >
                            <Icon name="pin" size={11} stroke="var(--sub)" />
                            {dict.search.viewMap}
                        </button>
                    </div>

                    <select
                        value={sort}
                        onChange={handleSort}
                        aria-label={dict.search.sortLabel}
                        className="h-9 rounded-md border bg-bg px-3 text-[12.5px] font-medium outline-none focus:border-ink border-line text-ink"
                    >
                        <option value="rating">{dict.search.sortRating}</option>
                        <option value="nearest">{dict.search.sortNearest}</option>
                        <option value="priceAsc">{dict.search.sortPriceAsc}</option>
                        <option value="priceDesc">{dict.search.sortPriceDesc}</option>
                    </select>

                    <button
                        type="button"
                        onClick={onOpenMobileFilters}
                        className="inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-[12.5px] font-semibold md:hidden border-line text-ink"
                    >
                        <Icon name="filter" size={13} />
                        {dict.search.filters}
                    </button>
                </div>
            </div>
        </section>
    );
}
