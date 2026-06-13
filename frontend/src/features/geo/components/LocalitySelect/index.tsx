'use client';

import { useEffect, useState } from 'react';

import { Field, Select } from '@/shared/components/hireeo';

import { getLocalitiesByRegion, getRegionsByCountry } from '../../actions';
import type { GeoLocality, GeoRegion } from '../../types/geoTypes';

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
            <Field label={regionLabel}>
                <Select
                    aria-label={regionLabel}
                    value={selectedRegion}
                    onChange={(e) => void handleRegionChange(e.target.value)}
                >
                    <option value="">Selecciona {regionLabel.toLowerCase()}</option>
                    {regions.map((r) => (
                        <option key={r.id} value={r.id}>
                            {r.name}
                        </option>
                    ))}
                </Select>
            </Field>

            {localities.length > 0 && (
                <Field label={localityLabel}>
                    <Select
                        aria-label={localityLabel}
                        onChange={(e) => handleLocalityChange(e.target.value)}
                    >
                        <option value="">Selecciona {localityLabel.toLowerCase()}</option>
                        {localities.map((l) => (
                            <option key={l.id} value={l.slug}>
                                {l.name}
                            </option>
                        ))}
                    </Select>
                </Field>
            )}
        </div>
    );
}
