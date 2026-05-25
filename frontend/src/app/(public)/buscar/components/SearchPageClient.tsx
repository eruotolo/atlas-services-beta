'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { Filter, MapPin, Search, X } from 'lucide-react';

import { getLocalitiesByRegion } from '@/features/geo/actions';
import type { GeoLocality, GeoRegion } from '@/features/geo/types/geoTypes';
import ServiceCard from '@/features/services/components/cards/ServiceCard';
import SponsorStandard from '@/features/sponsors/components/SponsorStandard';

import type { CategoriaServicio, Service } from '@/shared/types/common';

interface Sponsor {
    id: string;
    nombre: string;
    imagenUrl: string;
    linkExterno: string;
    descripcion?: string | null;
}

interface SearchPageClientProps {
    initialQuery: string;
    initialCategory: string;
    initialRegion?: string;
    initialLocality?: string;
    country?: string;
    regions?: GeoRegion[];
    sponsor: Sponsor | null;
    services: Service[];
    categories?: CategoriaServicio[];
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

function PaginationNav({
    currentPage,
    totalPages,
    onPageChange,
}: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}) {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
        (page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1,
    );

    return (
        <div className="mt-12 flex justify-center">
            <nav className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                    aria-label="Página anterior"
                >
                    <span className="sr-only">Anterior</span>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <title>Anterior</title>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                {pages.map((page, index) => {
                    const prevPage = pages[index - 1];
                    return (
                        <div key={page} className="flex items-center gap-2">
                            {prevPage && page - prevPage > 1 && (
                                <span className="px-1 text-gray-400">...</span>
                            )}
                            <button
                                type="button"
                                onClick={() => onPageChange(page)}
                                className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border transition-colors ${
                                    currentPage === page
                                        ? 'border-brand bg-brand font-bold text-white shadow-md dark:border-brand dark:bg-brand'
                                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                                }`}
                            >
                                {page}
                            </button>
                        </div>
                    );
                })}

                <button
                    type="button"
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                    aria-label="Página siguiente"
                >
                    <span className="sr-only">Siguiente</span>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <title>Siguiente</title>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </nav>
        </div>
    );
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Componente de búsqueda con filtros, paginación, regiones y localidades — complejidad inherente al UI
export default function SearchPageClient({
    initialQuery,
    initialCategory,
    initialRegion = '',
    initialLocality = '',
    country = 'cl',
    regions = [],
    sponsor,
    services,
    categories = [],
    totalCount,
    totalPages,
    currentPage,
}: SearchPageClientProps) {
    const router = useRouter();
    const [showFilters, setShowFilters] = useState(false);
    const [showAllCategories, setShowAllCategories] = useState(false);

    const [searchQuery, setSearchQuery] = useState<string>(initialQuery || '');
    const [selectedCategories, setSelectedCategories] = useState<string[]>(
        initialCategory && initialCategory !== 'Todos' ? initialCategory.split(',') : ['Todos'],
    );
    const [selectedRegion, setSelectedRegion] = useState<string>(initialRegion || '');
    const [searchRegion, setSearchRegion] = useState<string>(initialRegion || '');
    const [selectedLocality, setSelectedLocality] = useState<string>(initialLocality || '');
    const [searchLocality, setSearchLocality] = useState<string>(initialLocality || '');
    const [localities, setLocalities] = useState<GeoLocality[]>([]);

    useEffect(() => {
        setSearchQuery(initialQuery || '');
        setSelectedCategories(
            initialCategory && initialCategory !== 'Todos' ? initialCategory.split(',') : ['Todos'],
        );
        setSelectedRegion(initialRegion || '');
        setSearchRegion(initialRegion || '');
        setSelectedLocality(initialLocality || '');
        setSearchLocality(initialLocality || '');
    }, [initialQuery, initialCategory, initialRegion, initialLocality]);

    useEffect(() => {
        if (!searchRegion) {
            setLocalities([]);
            return;
        }
        const region = regions.find((r) => r.code === searchRegion);
        if (!region) return;
        getLocalitiesByRegion(region.id).then(setLocalities);
    }, [searchRegion, regions]);

    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Lógica de filtrado necesaria
    const updateFilters = (newParams: Record<string, string | number | undefined>) => {
        const params = new URLSearchParams();
        if (searchQuery) params.set('q', searchQuery);

        const category =
            newParams.c !== undefined ? String(newParams.c) : selectedCategories.join(',');
        const region = newParams.region !== undefined ? String(newParams.region) : selectedRegion;
        const locality = newParams.locality !== undefined ? String(newParams.locality) : selectedLocality;
        const page = newParams.page !== undefined ? newParams.page : 1;

        if (category && category !== 'Todos') params.set('c', category);
        if (region) params.set('region', region);
        if (locality) params.set('locality', locality);
        if (page && Number(page) > 1) params.set('page', String(page));

        router.push(`/${country}/buscar?${params.toString()}`, { scroll: true });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSelectedRegion(searchRegion);
        setSelectedLocality(searchLocality);
        updateFilters({ region: searchRegion, locality: searchLocality, page: 1 });
    };

    const handleCategoryChange = (category: string) => {
        const newCategories = toggleCategory(selectedCategories, category);
        setSelectedCategories(newCategories);
        updateFilters({ c: newCategories.join(','), page: 1 });
    };

    const handleRegionChange = (region: string) => {
        setSelectedRegion(region);
        setSearchRegion(region);
        setSelectedLocality('');
        setSearchLocality('');
        updateFilters({ region, locality: '', page: 1 });
    };

    const handleLocalityChange = (locality: string) => {
        setSelectedLocality(locality);
        setSearchLocality(locality);
        updateFilters({ locality, page: 1 });
    };

    const handlePageChange = (page: number) => {
        updateFilters({ page });
    };

    const resetFilters = () => {
        setSearchQuery('');
        setSearchRegion('');
        setSelectedCategories(['Todos']);
        setSelectedRegion('');
        setSelectedLocality('');
        setSearchLocality('');
        setLocalities([]);
        router.push(`/${country}/buscar`);
    };

    const INITIAL_CATEGORIES_LIMIT = 20;
    const visibleCategories = showAllCategories
        ? categories
        : categories.slice(0, INITIAL_CATEGORIES_LIMIT);
    const hasMoreCategories = categories.length > INITIAL_CATEGORIES_LIMIT;

    return (
        <section className="bg-background min-h-screen py-10 pb-20 transition-colors duration-300">
            <div className="container mx-auto max-w-site px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-8 md:flex-row">
                    {/* Sidebar Filters */}
                    <aside
                        className={`shrink-0 md:w-64 ${showFilters ? 'dark:bg-background fixed inset-0 z-50 overflow-y-auto bg-white p-6' : 'hidden md:block'}`}
                    >
                        <div className="mb-6 flex items-center justify-between md:mb-8">
                            <h2 className="text-xl font-bold md:text-xs md:font-black md:tracking-widest md:text-gray-500 md:uppercase dark:text-gray-500">
                                Filtros
                            </h2>
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="cursor-pointer text-xs font-bold text-brand hover:underline dark:text-brand-light"
                            >
                                Limpiar filtros
                            </button>
                            <button
                                type="button"
                                className="cursor-pointer md:hidden dark:text-white"
                                onClick={() => setShowFilters(false)}
                            >
                                <X />
                            </button>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <h3 className="mb-4 text-xs font-bold tracking-widest text-gray-500 uppercase dark:text-gray-500">
                                    Categoría
                                </h3>
                                <div className="space-y-2">
                                    <label className="group flex cursor-pointer items-center gap-3">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand dark:border-gray-500 dark:bg-gray-800 dark:checked:bg-brand"
                                            checked={selectedCategories.includes('Todos')}
                                            onChange={() => handleCategoryChange('Todos')}
                                        />
                                        <span
                                            className={`text-sm ${selectedCategories.includes('Todos') ? 'font-bold text-brand dark:text-brand-light' : 'text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200'}`}
                                        >
                                            Todos
                                        </span>
                                    </label>
                                    {visibleCategories.map((cat) => (
                                        <label
                                            key={cat.id}
                                            className="group flex cursor-pointer items-center gap-3"
                                        >
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand dark:border-gray-500 dark:bg-gray-800 dark:checked:bg-brand"
                                                checked={
                                                    selectedCategories.includes(cat.id) ||
                                                    selectedCategories.includes(cat.nombre)
                                                }
                                                onChange={() => handleCategoryChange(cat.id)}
                                            />
                                            <span
                                                className={`text-sm ${selectedCategories.includes(cat.id) || selectedCategories.includes(cat.nombre) ? 'font-bold text-brand dark:text-brand-light' : 'text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200'}`}
                                            >
                                                {cat.nombre}
                                            </span>
                                        </label>
                                    ))}
                                    {hasMoreCategories && (
                                        <button
                                            type="button"
                                            onClick={() => setShowAllCategories(!showAllCategories)}
                                            className="mt-3 w-full cursor-pointer rounded-lg border border-gray-200 bg-gray-50 py-2 text-xs font-bold text-gray-600 transition-colors hover:bg-gray-100 dark:border-white/5 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800"
                                        >
                                            {showAllCategories
                                                ? 'Ver menos categorías'
                                                : `Ver todas las categorías (+${categories.length - INITIAL_CATEGORIES_LIMIT})`}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {regions.length > 0 && (
                                <div>
                                    <h3 className="mb-4 text-xs font-bold tracking-widest text-gray-500 uppercase dark:text-gray-500">
                                        Región
                                    </h3>
                                    <select
                                        className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-brand dark:border-white/10 dark:bg-gray-900 dark:text-white"
                                        value={selectedRegion}
                                        onChange={(e) => handleRegionChange(e.target.value)}
                                    >
                                        <option value="" className="dark:bg-gray-900">
                                            Todas las regiones
                                        </option>
                                        {regions.map((r) => (
                                            <option
                                                key={r.id}
                                                value={r.code}
                                                className="dark:bg-gray-900"
                                            >
                                                {r.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {localities.length > 0 && (
                                <div>
                                    <h3 className="mb-4 text-xs font-bold tracking-widest text-gray-500 uppercase dark:text-gray-500">
                                        Ciudad
                                    </h3>
                                    <select
                                        className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-brand dark:border-white/10 dark:bg-gray-900 dark:text-white"
                                        value={selectedLocality}
                                        onChange={(e) => handleLocalityChange(e.target.value)}
                                    >
                                        <option value="" className="dark:bg-gray-900">
                                            Todas las ciudades
                                        </option>
                                        {localities.map((l) => (
                                            <option
                                                key={l.id}
                                                value={l.slug}
                                                className="dark:bg-gray-900"
                                            >
                                                {l.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* SPONSOR STANDARD */}
                            <SponsorStandard sponsor={sponsor} />
                        </div>

                        {showFilters && (
                            <button
                                type="button"
                                onClick={() => setShowFilters(false)}
                                className="btn-primary mt-8 w-full cursor-pointer rounded-xl py-3"
                            >
                                Ver {totalCount} resultados
                            </button>
                        )}
                    </aside>

                    {/* Results Area */}
                    <div className="flex-grow">
                        {/* Buscador Principal */}
                        <div className="mb-8">
                            <form
                                onSubmit={handleSearch}
                                className="flex flex-col items-stretch overflow-hidden rounded-2xl border border-gray-100 bg-white p-2 shadow-xl shadow-brand-marino/5 md:flex-row md:items-center dark:border-white/10 dark:bg-gray-900/40 dark:backdrop-blur-xl"
                            >
                                <div className="flex flex-grow items-center gap-3 px-4 py-3">
                                    <Search className="text-gray-500" size={20} />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Buscar por nombre, categoría, descripción..."
                                        className="w-full border-none bg-transparent text-gray-700 outline-none placeholder:text-gray-500 focus:ring-0 dark:text-white"
                                    />
                                </div>

                                {regions.length > 0 && (
                                    <div className="flex items-center gap-2 border-t border-gray-100 px-4 py-3 md:border-t-0 md:border-l dark:border-white/10">
                                        <MapPin
                                            className="text-brand dark:text-brand-light"
                                            size={18}
                                        />
                                        <select
                                            aria-label="Filtrar por región"
                                            value={searchRegion}
                                            onChange={(e) => {
                                                setSearchRegion(e.target.value);
                                                setSearchLocality('');
                                            }}
                                            className="border-none bg-transparent text-sm font-medium text-gray-700 outline-none focus:ring-0 dark:text-white"
                                        >
                                            <option value="" className="dark:bg-gray-900">
                                                Todas las regiones
                                            </option>
                                            {regions.map((r) => (
                                                <option
                                                    key={r.id}
                                                    value={r.code}
                                                    className="dark:bg-gray-900"
                                                >
                                                    {r.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {localities.length > 0 && (
                                    <div className="flex items-center gap-2 border-t border-gray-100 px-4 py-3 md:border-t-0 md:border-l dark:border-white/10">
                                        <select
                                            aria-label="Filtrar por ciudad"
                                            value={searchLocality}
                                            onChange={(e) => setSearchLocality(e.target.value)}
                                            className="border-none bg-transparent text-sm font-medium text-gray-700 outline-none focus:ring-0 dark:text-white"
                                        >
                                            <option value="" className="dark:bg-gray-900">
                                                Todas las ciudades
                                            </option>
                                            {localities.map((l) => (
                                                <option
                                                    key={l.id}
                                                    value={l.slug}
                                                    className="dark:bg-gray-900"
                                                >
                                                    {l.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="btn-primary m-1 cursor-pointer rounded-xl px-8 py-3"
                                >
                                    Buscar
                                </button>
                            </form>
                        </div>

                        <div className="mb-8 flex items-center justify-between">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {totalCount} resultados{' '}
                                {initialQuery ? ` para "${initialQuery}"` : ''}
                            </h1>
                            <button
                                type="button"
                                onClick={() => setShowFilters(true)}
                                className="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold shadow-sm md:hidden dark:border-white/10 dark:bg-gray-900 dark:text-white"
                            >
                                <Filter size={16} />
                                Filtrar
                            </button>
                        </div>

                        {services.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                    {services.map((service) => (
                                        <div key={service.id} className="stagger-item">
                                            <ServiceCard service={service} />
                                        </div>
                                    ))}
                                </div>

                                {totalPages > 1 && (
                                    <PaginationNav
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={handlePageChange}
                                    />
                                )}
                            </>
                        ) : (
                            <div className="rounded-3xl border border-gray-100 bg-white p-20 text-center dark:border-white/10 dark:bg-gray-900/40">
                                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-800">
                                    <X size={40} className="text-gray-300 dark:text-gray-500" />
                                </div>
                                <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                                    No encontramos resultados
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Intenta buscando con palabras más generales o cambiando los
                                    filtros.
                                </p>
                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="mt-6 cursor-pointer font-bold text-brand hover:underline dark:text-brand-light"
                                >
                                    Limpiar todos los filtros
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
