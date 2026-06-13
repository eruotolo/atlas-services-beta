import type { Metadata } from 'next';

import { getCategorias } from '@/features/categories/actions';
import { getRegionsByCountry } from '@/features/geo/actions';
import { COUNTRY_SEO_CONFIG } from '@/features/geo/lib/countryUtils';
import { SearchPageClient } from '@/features/services/components/search';
import { getFilteredServices } from '@/features/services/actions';
import { buildSearchTitle, parseCategoryParam } from '@/features/services/lib/searchTitle';
import { getSponsorStandardRandom } from '@/features/sponsors/actions';

import { searchLocalitiesByCountry } from '@/features/geo/actions/queries';
import { getDictionary } from '@/lib/i18n/getDictionary';

async function resolveCoordsToLocality(lat: string, lng: string, countryCode: string): Promise<{ regionCode: string; localitySlug: string } | null> {
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
            headers: { 'User-Agent': 'AtlasServicesSearch/1.0' },
            next: { revalidate: 86400 }
        });
        if (!res.ok) return null;
        const data = await res.json();
        const address = data.address;
        if (!address) return null;
        
        const searchTerms = [
            address.city,
            address.town,
            address.village,
            address.municipality,
            address.county,
            address.state
        ].filter(Boolean).map(t => t.toLowerCase());

        const localities = await searchLocalitiesByCountry(countryCode);
        
        for (const term of searchTerms) {
            let match = localities.find(l => l.name.toLowerCase() === term);
            if (!match) {
                match = localities.find(l => l.name.toLowerCase().includes(term) || term.includes(l.name.toLowerCase()));
            }
            if (match) {
                return {
                    regionCode: '',
                    localitySlug: match.slug
                };
            }
        }
        return null;
    } catch (e) {
        console.error('Error resolving coords:', e);
        return null;
    }
}

type Props = {
    params: Promise<{ country: string }>;
    searchParams: Promise<{
        q?: string;
        c?: string;
        region?: string;
        locality?: string;
        page?: string;
        lat?: string;
        lng?: string;
    }>;
};

export async function generateMetadata({
    params: routeParams,
    searchParams,
}: Props): Promise<Metadata> {
    const { country } = await routeParams;
    const params = await searchParams;
    const countryName = COUNTRY_SEO_CONFIG[country]?.countryName ?? country.toUpperCase();
    const dict = getDictionary(country);
    const query = params.q;
    const categoryNames = parseCategoryParam(params.c ?? '');

    const computedTitle = buildSearchTitle({
        categoryNames,
        localityName: null,
        regionName: null,
        countryName,
        defaultTitle: dict.search.defaultTitle,
        prepositionIn: dict.search.prepositionIn,
        multipleCategoriesSuffix: dict.search.multipleCategoriesSuffix,
    });

    let title = computedTitle;
    let description = `Encuentra profesionales verificados en ${countryName}. Presupuestos gratis.`;

    if (query) {
        title = `Resultados para "${query}" en ${countryName}`;
        description = `Resultados de búsqueda para "${query}". Contacta profesionales locales rápidamente.`;
    } else if (categoryNames.length === 1) {
        description = `Los mejores profesionales de ${categoryNames[0]} en ${countryName}. Presupuestos gratis.`;
    } else if (categoryNames.length > 1) {
        description = `Los mejores profesionales en ${countryName}. Presupuestos gratis.`;
    }

    return { title, description };
}

export default async function CountrySearchPage({ params: routeParams, searchParams }: Props) {
    const { country } = await routeParams;
    const params = await searchParams;
    const query = params.q?.toLowerCase() || '';
    const categoryParam = params.c || 'Todos';
    let regionParam = params.region || '';
    let localityParam = params.locality || '';
    const latParam = params.lat;
    const lngParam = params.lng;

    if (!regionParam && !localityParam && latParam && lngParam) {
        const resolved = await resolveCoordsToLocality(latParam, lngParam, country);
        if (resolved) {
            regionParam = resolved.regionCode;
            localityParam = resolved.localitySlug;
        }
    }

    const pageParam = Number(params.page) || 1;
    const dict = getDictionary(country);

    const [{ services, totalCount, totalPages, currentPage }, categories, regions, sponsor] =
        await Promise.all([
            getFilteredServices({
                query,
                category: categoryParam,
                countryCode: country,
                regionCode: regionParam,
                localitySlug: localityParam,
                page: pageParam,
            }),
            getCategorias(country),
            getRegionsByCountry(country),
            getSponsorStandardRandom(categoryParam),
        ]);

    return (
        <SearchPageClient
            dict={dict}
            country={country}
            initialQuery={query}
            initialCategory={categoryParam}
            initialRegion={regionParam}
            initialLocality={localityParam}
            regions={regions}
            sponsor={sponsor}
            services={services}
            categories={categories}
            totalCount={totalCount}
            totalPages={totalPages}
            currentPage={currentPage}
        />
    );
}
