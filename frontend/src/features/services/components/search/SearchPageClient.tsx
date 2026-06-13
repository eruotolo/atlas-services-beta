'use client';

import { useEffect, useMemo, useState, type ReactElement } from 'react';

import { useRouter } from 'next/navigation';

import { getLocalitiesByRegion } from '@/features/geo/actions';
import { COUNTRY_CONFIG } from '@/features/geo/lib/countryUtils';
import type { GeoLocality, GeoRegion } from '@/features/geo/types/geoTypes';
import type { Dictionary } from '@/lib/i18n/types';
import { Btn, Icon } from '@/shared/components/hireeo';
import type { CategoriaServicio, Service } from '@/shared/types/common';

import { EmptyResults } from './EmptyResults';
import { FiltersSidebar } from './FiltersSidebar';
import { ProviderRow } from './ProviderRow';
import { ResultsHeader } from './ResultsHeader';
import { SearchHeader } from './SearchHeader';
import { SearchPagination } from './SearchPagination';
import { SponsorBanner, type SearchSponsor } from './SponsorBanner';
import {
    DEFAULT_CLIENT_FILTERS,
    type AvailabilityFilter,
    type ClientFilters,
    type RatingFilter,
    type SortOption,
    type VerificationFilter,
} from './types';

interface SearchPageClientProps {
    dict: Dictionary;
    country: string;
    initialQuery: string;
    initialCategory: string;
    initialRegion: string;
    initialLocality: string;
    regions: GeoRegion[];
    sponsor: SearchSponsor | null;
    services: Service[];
    categories: CategoriaServicio[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
}

function toggleCategory(current: string[], category: string): string[] {
    if (category === 'Todos') return ['Todos'];
    const filtered = current.filter((c) => c !== 'Todos');
    const updated = filtered.includes(category)
        ? filtered.filter((c) => c !== category)
        : [...filtered, category];
    return updated.length === 0 ? ['Todos'] : updated;
}

function ratingThreshold(r: RatingFilter): number | null {
    if (r === 'r45') return 4.5;
    if (r === 'r40') return 4.0;
    if (r === 'r35') return 3.5;
    return null;
}

function applyClientFilters(services: Service[], f: ClientFilters): Service[] {
    let list = services;

    const minRating = ratingThreshold(f.rating);
    if (minRating !== null) list = list.filter((s) => s.rating >= minRating);

    if (f.verification === 'pro' || f.verification === 'top') {
        list = list.filter((s) => s.isPremium);
    }

    if (f.priceMin !== null) list = list.filter((s) => s.price >= (f.priceMin ?? 0));
    if (f.priceMax !== null) {
        list = list.filter((s) => s.price <= (f.priceMax ?? Number.POSITIVE_INFINITY));
    }

    if (f.sort === 'priceAsc') list = [...list].sort((a, b) => a.price - b.price);
    else if (f.sort === 'priceDesc') list = [...list].sort((a, b) => b.price - a.price);
    else if (f.sort === 'rating') list = [...list].sort((a, b) => b.rating - a.rating);

    return list;
}

interface ChipsConfig {
    dict: Dictionary;
    filters: ClientFilters;
    onClearRating: () => void;
    onClearVerification: () => void;
    onClearAvailability: () => void;
    onClearPrice: () => void;
}

function buildActiveChips(c: ChipsConfig): Array<{
    key: string;
    label: string;
    onRemove: () => void;
}> {
    const chips: Array<{ key: string; label: string; onRemove: () => void }> = [];
    const { dict, filters } = c;

    if (filters.rating !== 'any') {
        const labelMap: Record<RatingFilter, string> = {
            any: '',
            r45: dict.search.rating45,
            r40: dict.search.rating40,
            r35: dict.search.rating35,
        };
        chips.push({
            key: 'rating',
            label: labelMap[filters.rating],
            onRemove: c.onClearRating,
        });
    }
    if (filters.verification !== 'any') {
        const labelMap: Record<VerificationFilter, string> = {
            any: '',
            verified: dict.search.verifVerified,
            pro: dict.search.verifPro,
            top: dict.search.verifTop,
        };
        chips.push({
            key: 'verification',
            label: labelMap[filters.verification],
            onRemove: c.onClearVerification,
        });
    }
    if (filters.availability !== 'any') {
        const labelMap: Record<AvailabilityFilter, string> = {
            any: '',
            today: dict.search.availabilityToday,
            tomorrow: dict.search.availabilityTomorrow,
            thisWeek: dict.search.availabilityThisWeek,
            twoWeeks: dict.search.availabilityTwoWeeks,
        };
        chips.push({
            key: 'availability',
            label: labelMap[filters.availability],
            onRemove: c.onClearAvailability,
        });
    }
    if (filters.priceMin !== null || filters.priceMax !== null) {
        const min = filters.priceMin ?? 0;
        const max = filters.priceMax ?? '∞';
        chips.push({
            key: 'price',
            label: `${dict.search.groupPrice}: ${min}–${max}`,
            onRemove: c.onClearPrice,
        });
    }
    return chips;
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: orchestrator del Buscar (state + URL sync + client filters)
export function SearchPageClient({
    dict,
    country,
    initialQuery,
    initialCategory,
    initialRegion,
    initialLocality,
    regions,
    sponsor,
    services,
    categories,
    totalCount,
    totalPages,
    currentPage,
}: SearchPageClientProps): ReactElement {
    const router = useRouter();
    const config = COUNTRY_CONFIG[country] ?? COUNTRY_CONFIG.cl;

    const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
    const [selectedCategories, setSelectedCategories] = useState<string[]>(
        initialCategory && initialCategory !== 'Todos' ? initialCategory.split(',') : ['Todos'],
    );
    const [selectedRegion, setSelectedRegion] = useState<string>(initialRegion);
    const [selectedLocality, setSelectedLocality] = useState<string>(initialLocality);
    const [localities, setLocalities] = useState<GeoLocality[]>([]);
    const [clientFilters, setClientFilters] = useState<ClientFilters>(DEFAULT_CLIENT_FILTERS);

    useEffect(() => {
        setSearchQuery(initialQuery);
        setSelectedCategories(
            initialCategory && initialCategory !== 'Todos'
                ? initialCategory.split(',')
                : ['Todos'],
        );
        setSelectedRegion(initialRegion);
        setSelectedLocality(initialLocality);
    }, [initialQuery, initialCategory, initialRegion, initialLocality]);

    useEffect(() => {
        if (!selectedRegion) {
            setLocalities([]);
            return;
        }
        const region = regions.find((r) => r.code === selectedRegion);
        if (!region) return;
        getLocalitiesByRegion(region.id).then(setLocalities);
    }, [selectedRegion, regions]);

    function pushFilters(overrides: {
        q?: string;
        c?: string;
        region?: string;
        locality?: string;
        page?: number;
    }): void {
        const params = new URLSearchParams();
        const q = overrides.q ?? searchQuery;
        const c = overrides.c ?? selectedCategories.join(',');
        const region = overrides.region ?? selectedRegion;
        const locality = overrides.locality ?? selectedLocality;
        const page = overrides.page ?? 1;

        if (q) params.set('q', q);
        if (c && c !== 'Todos') params.set('c', c);
        if (region) params.set('region', region);
        if (locality) params.set('locality', locality);
        if (page > 1) params.set('page', String(page));

        router.push(`/${country}/search?${params.toString()}`, { scroll: true });
    }

    function handleSubmit(): void {
        pushFilters({ page: 1 });
    }

    function handleCategoryToggle(categoryId: string): void {
        const updated = toggleCategory(selectedCategories, categoryId);
        setSelectedCategories(updated);
        pushFilters({ c: updated.join(','), page: 1 });
    }

    function handleRegionChange(regionCode: string): void {
        setSelectedRegion(regionCode);
        setSelectedLocality('');
        pushFilters({ region: regionCode, locality: '', page: 1 });
    }

    function handleLocalityChange(localitySlug: string): void {
        setSelectedLocality(localitySlug);
        pushFilters({ locality: localitySlug, page: 1 });
    }

    function handlePageChange(page: number): void {
        pushFilters({ page });
    }

    function handleClearAll(): void {
        setSearchQuery('');
        setSelectedCategories(['Todos']);
        setSelectedRegion('');
        setSelectedLocality('');
        setLocalities([]);
        setClientFilters(DEFAULT_CLIENT_FILTERS);
        router.push(`/${country}/search`);
    }

    function patchClientFilters(patch: Partial<ClientFilters>): void {
        setClientFilters((prev) => ({ ...prev, ...patch }));
    }

    const filteredServices = useMemo(
        () => applyClientFilters(services, clientFilters),
        [services, clientFilters],
    );

    const activeChips = useMemo(
        () =>
            buildActiveChips({
                dict,
                filters: clientFilters,
                onClearRating: () =>
                    setClientFilters((prev) => ({ ...prev, rating: 'any' })),
                onClearVerification: () =>
                    setClientFilters((prev) => ({ ...prev, verification: 'any' })),
                onClearAvailability: () =>
                    setClientFilters((prev) => ({ ...prev, availability: 'any' })),
                onClearPrice: () =>
                    setClientFilters((prev) => ({ ...prev, priceMin: null, priceMax: null })),
            }),
        [dict, clientFilters],
    );

    const sidebarProps = {
        dict,
        categories,
        selectedCategories,
        onCategoryToggle: handleCategoryToggle,
        availability: clientFilters.availability,
        onAvailabilityChange: (a: AvailabilityFilter) => patchClientFilters({ availability: a }),
        rating: clientFilters.rating,
        onRatingChange: (r: RatingFilter) => patchClientFilters({ rating: r }),
        verification: clientFilters.verification,
        onVerificationChange: (v: VerificationFilter) => patchClientFilters({ verification: v }),
        priceMin: clientFilters.priceMin,
        priceMax: clientFilters.priceMax,
        onPriceMinChange: (n: number | null) => patchClientFilters({ priceMin: n }),
        onPriceMaxChange: (n: number | null) => patchClientFilters({ priceMax: n }),
        onClearAll: handleClearAll,
        activeChips,
    };

    return (
        <div className="bg-bg">
            <SearchHeader
                dict={dict}
                searchQuery={searchQuery}
                onQueryChange={setSearchQuery}
                selectedRegion={selectedRegion}
                onRegionChange={handleRegionChange}
                regions={regions}
                selectedLocality={selectedLocality}
                onLocalityChange={handleLocalityChange}
                localities={localities}
                onSubmit={handleSubmit}
            />

            <ResultsHeader
                dict={dict}
                country={country}
                selectedRegion={selectedRegion}
                regions={regions}
                selectedLocality={selectedLocality}
                localities={localities}
                selectedCategory={selectedCategories.join(',')}
                totalCount={totalCount}
                activeChips={activeChips}
                sort={clientFilters.sort}
                onSortChange={(s: SortOption) => patchClientFilters({ sort: s })}
                onOpenMobileFilters={() => setShowMobileFilters(true)}
            />

            <section className="mx-auto max-w-site px-6 pt-6 pb-16 sm:px-10 lg:px-14">
                <div className="grid gap-7 md:grid-cols-[260px_minmax(0,1fr)]">
                    <aside className="hidden md:block">
                        <FiltersSidebar {...sidebarProps} />
                    </aside>

                    {showMobileFilters ? (
                        <div
                            className="fixed inset-0 z-50 overflow-y-auto p-6 md:hidden bg-bg"
                        >
                            <div className="mb-4 flex items-center justify-between">
                                <span
                                    className="text-[16px] font-semibold text-ink"
                                >
                                    {dict.search.filters}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setShowMobileFilters(false)}
                                    aria-label="Cerrar"
                                    className="cursor-pointer text-ink"
                                >
                                    <Icon name="x" size={20} />
                                </button>
                            </div>
                            <FiltersSidebar {...sidebarProps} />
                            <Btn
                                variant="primary"
                                className="mt-6 w-full justify-center"
                                onClick={() => setShowMobileFilters(false)}
                            >
                                {`${dict.search.results} (${filteredServices.length})`}
                            </Btn>
                        </div>
                    ) : null}

                    <div className="min-w-0">
                        {sponsor ? <SponsorBanner sponsor={sponsor} dict={dict} /> : null}

                        {filteredServices.length > 0 ? (
                            <>
                                <div className="flex flex-col gap-2">
                                    {filteredServices.map((s) => (
                                        <ProviderRow
                                            key={s.id}
                                            service={s}
                                            dict={dict}
                                            locale={config.locale}
                                            currencySymbol={config.currencySymbol}
                                        />
                                    ))}
                                </div>
                                {totalPages > 1 ? (
                                    <SearchPagination
                                        dict={dict}
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        totalCount={totalCount}
                                        onPageChange={handlePageChange}
                                    />
                                ) : null}
                            </>
                        ) : (
                            <EmptyResults dict={dict} onReset={handleClearAll} />
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
