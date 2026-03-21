import type { Metadata } from 'next';

import { getCategorias } from '@/features/categories/actions';
import { getRegionsByCountry } from '@/features/geo/actions';
import { COUNTRY_SEO_CONFIG } from '@/features/geo/lib/countryUtils';
import { getFilteredServices } from '@/features/services/actions';
import { getSponsorStandardRandom } from '@/features/sponsors/actions';

import SearchPageClient from '@/app/(public)/buscar/components/SearchPageClient';

type Props = {
    params: Promise<{ country: string }>;
    searchParams: Promise<{ q?: string; c?: string; region?: string; locality?: string; page?: string }>;
};

export async function generateMetadata({
    params: routeParams,
    searchParams,
}: Props): Promise<Metadata> {
    const { country } = await routeParams;
    const params = await searchParams;
    const countryName = COUNTRY_SEO_CONFIG[country]?.countryName ?? country.toUpperCase();
    const query = params.q;
    const category = params.c;

    let title = `Buscar Servicios Profesionales en ${countryName}`;
    let description = `Encuentra carpinteros, gasfíter, electricistas y más profesionales verificados en ${countryName}.`;

    if (query) {
        title = `Resultados para "${query}" en ${countryName}`;
        description = `Resultados de búsqueda para "${query}". Contacta profesionales locales rápidamente.`;
    } else if (category && category !== 'Todos') {
        title = `Servicios de ${category} en ${countryName}`;
        description = `Los mejores profesionales de ${category} en ${countryName}. Presupuestos gratis.`;
    }

    return { title, description };
}

export default async function CountrySearchPage({ params: routeParams, searchParams }: Props) {
    const { country } = await routeParams;
    const params = await searchParams;
    const query = params.q?.toLowerCase() || '';
    const categoryParam = params.c || 'Todos';
    const regionParam = params.region || '';
    const localityParam = params.locality || '';
    const pageParam = Number(params.page) || 1;

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
            initialQuery={query}
            initialCategory={categoryParam}
            initialRegion={regionParam}
            initialLocality={localityParam}
            country={country}
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
