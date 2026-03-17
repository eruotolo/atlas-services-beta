import type { Metadata } from 'next';

import { getCategorias } from '@/features/categories/actions';
import { getFilteredServices } from '@/features/services/actions';
import { getSponsorStandardRandom } from '@/features/sponsors/actions';

import SearchPageClient from './components/SearchPageClient';

type Props = {
    searchParams: Promise<{ q?: string; c?: string; comuna?: string; page?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
    const params = await searchParams;
    const query = params.q;
    const category = params.c;
    const comuna = params.comuna;

    let title = 'Buscar Servicios Profesionales';
    let description =
        'Encuentra carpinteros, gasfíter, electricistas y más profesionales verificados en toda la Isla de Chiloé.';

    if (query) {
        title = `Resultados para "${query}"`;
        description = `Resultados de búsqueda para "${query}" en Chiloé. Contacta profesionales locales rápidamente.`;
    } else if (category && category !== 'Todos') {
        title = `Servicios de ${category} en Chiloé`;
        description = `Los mejores profesionales de ${category} en Castro, Ancud y alrededores. Presupuestos gratis.`;
    }

    if (comuna && comuna !== 'Todas') {
        title += ` en ${comuna}`;
        description += ` Encuentra expertos en ${comuna}.`;
    }

    return {
        title,
        description,
        alternates: {
            canonical: `/buscar${query ? `?q=${query}` : ''}`,
        },
    };
}

export default async function SearchPage({ searchParams }: Props) {
    const params = await searchParams;
    const query = params.q?.toLowerCase() || '';
    const categoryParam = params.c || 'Todos';
    const comunaParam = params.comuna || 'Todas';
    const pageParam = Number(params.page) || 1;

    // Obtener servicios filtrados desde el servidor
    const { services, totalCount, totalPages, currentPage } = await getFilteredServices({
        query,
        category: categoryParam,
        comuna: comunaParam,
        page: pageParam,
    });

    // Obtener categorías para filtros
    const categories = await getCategorias(true);

    // Obtener sponsor random basado en la categoría seleccionada
    const sponsor = await getSponsorStandardRandom(categoryParam);

    return (
        <SearchPageClient
            initialQuery={query}
            initialCategory={categoryParam}
            initialComuna={comunaParam}
            sponsor={sponsor}
            services={services}
            categories={categories}
            totalCount={totalCount}
            totalPages={totalPages}
            currentPage={currentPage}
        />
    );
}
