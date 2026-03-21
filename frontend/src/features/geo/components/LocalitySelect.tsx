'use client';

import { useEffect, useId, useState } from 'react';

import { getLocalitiesByRegion, getRegionsByCountry } from '../actions';
import type { GeoLocality, GeoRegion } from '../types/geoTypes';

interface LocalitySelectProps {
    countryCode: string;
    regionLabel: string;
    localityLabel: string;
    onSelect: (data: { localitySlug: string; localityName: string; regionCode: string }) => void;
}

export function LocalitySelect({
    countryCode,
    regionLabel,
    localityLabel,
    onSelect,
}: LocalitySelectProps) {
    const id = useId();
    const regionId = `${id}-region`;
    const localityId = `${id}-locality`;
    const [regions, setRegions] = useState<GeoRegion[]>([]);
    const [localities, setLocalities] = useState<GeoLocality[]>([]);
    const [selectedRegion, setSelectedRegion] = useState('');

    useEffect(() => {
        getRegionsByCountry(countryCode).then(setRegions);
    }, [countryCode]);

    async function handleRegionChange(regionId: string) {
        setSelectedRegion(regionId);
        setLocalities([]);
        if (!regionId) return;
        const locs = await getLocalitiesByRegion(regionId);
        setLocalities(locs);
    }

    function handleLocalityChange(localitySlug: string) {
        const region = regions.find((r) => r.id === selectedRegion);
        const locality = localities.find((l) => l.slug === localitySlug);
        if (!region || !locality) return;
        onSelect({
            localitySlug: locality.slug,
            localityName: locality.name,
            regionCode: region.code,
        });
    }

    return (
        <div className="flex flex-col gap-3">
            <div>
                <label
                    htmlFor={regionId}
                    className="mb-1 block text-sm font-bold text-gray-700 dark:text-gray-300"
                >
                    {regionLabel}
                </label>
                <select
                    id={regionId}
                    aria-label={regionLabel}
                    value={selectedRegion}
                    onChange={(e) => void handleRegionChange(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 dark:border-white/10 dark:bg-gray-900 dark:text-white"
                >
                    <option value="">Selecciona {regionLabel.toLowerCase()}</option>
                    {regions.map((r) => (
                        <option key={r.id} value={r.id}>
                            {r.name}
                        </option>
                    ))}
                </select>
            </div>

            {localities.length > 0 && (
                <div>
                    <label
                        htmlFor={localityId}
                        className="mb-1 block text-sm font-bold text-gray-700 dark:text-gray-300"
                    >
                        {localityLabel}
                    </label>
                    <select
                        id={localityId}
                        aria-label={localityLabel}
                        onChange={(e) => handleLocalityChange(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 dark:border-white/10 dark:bg-gray-900 dark:text-white"
                    >
                        <option value="">Selecciona {localityLabel.toLowerCase()}</option>
                        {localities.map((l) => (
                            <option key={l.id} value={l.slug}>
                                {l.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
}
