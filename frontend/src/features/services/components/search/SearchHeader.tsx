'use client';

import type { ChangeEvent, FormEvent, ReactElement } from 'react';

import type { GeoLocality, GeoRegion } from '@/features/geo/types/geoTypes';
import type { Dictionary } from '@/lib/i18n/types';
import { Btn, Icon } from '@/shared/components/hireeo';

interface SearchHeaderProps {
    dict: Dictionary;
    searchQuery: string;
    onQueryChange: (q: string) => void;
    selectedRegion: string;
    onRegionChange: (regionCode: string) => void;
    regions: GeoRegion[];
    selectedLocality: string;
    onLocalityChange: (localitySlug: string) => void;
    localities: GeoLocality[];
    onSubmit: () => void;
}

function selectFieldStyles(): string {
    return 'h-10 rounded-md border bg-bg px-3 text-[13px] outline-none focus:border-ink';
}

export function SearchHeader({
    dict,
    searchQuery,
    onQueryChange,
    selectedRegion,
    onRegionChange,
    regions,
    selectedLocality,
    onLocalityChange,
    localities,
    onSubmit,
}: SearchHeaderProps): ReactElement {
    function handleSubmit(e: FormEvent<HTMLFormElement>): void {
        e.preventDefault();
        onSubmit();
    }

    function handleRegion(e: ChangeEvent<HTMLSelectElement>): void {
        onRegionChange(e.target.value);
    }

    function handleLocality(e: ChangeEvent<HTMLSelectElement>): void {
        onLocalityChange(e.target.value);
    }

    return (
        <section
            className="border-b"
            style={{ borderColor: 'var(--line)', background: 'var(--tint)' }}
        >
            <div className="mx-auto max-w-site px-6 py-5 sm:px-10 lg:px-14">
                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 gap-2.5 md:grid-cols-[1.7fr_1fr_1fr_auto]"
                >
                    <div
                        className="relative flex items-center rounded-md border bg-bg"
                        style={{ borderColor: 'var(--line)' }}
                    >
                        <span
                            className="pointer-events-none absolute left-3 inline-flex"
                            style={{ color: 'var(--muted)' }}
                        >
                            <Icon name="search" size={14} />
                        </span>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => onQueryChange(e.target.value)}
                            placeholder={dict.search.placeholder}
                            className="h-10 w-full bg-transparent pr-3 pl-9 text-[13px] outline-none"
                            style={{ color: 'var(--ink)' }}
                        />
                    </div>

                    <select
                        value={selectedRegion}
                        onChange={handleRegion}
                        aria-label={dict.search.region}
                        className={selectFieldStyles()}
                        style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
                    >
                        <option value="">{dict.search.allRegions}</option>
                        {regions.map((r) => (
                            <option key={r.id} value={r.code}>
                                {r.name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={selectedLocality}
                        onChange={handleLocality}
                        disabled={localities.length === 0}
                        aria-label={dict.search.city}
                        className={selectFieldStyles()}
                        style={{
                            borderColor: 'var(--line)',
                            color: 'var(--ink)',
                            opacity: localities.length === 0 ? 0.5 : 1,
                        }}
                    >
                        <option value="">{dict.search.allCities}</option>
                        {localities.map((l) => (
                            <option key={l.id} value={l.slug}>
                                {l.name}
                            </option>
                        ))}
                    </select>

                    <Btn type="submit" variant="primary" iconRight="arrow">
                        {dict.search.searchButton}
                    </Btn>
                </form>
            </div>
        </section>
    );
}
