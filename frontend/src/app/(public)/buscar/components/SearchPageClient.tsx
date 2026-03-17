'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { Filter, MapPin, Search, X } from 'lucide-react';

import ServiceCard from '@/features/services/components/cards/ServiceCard';
import SponsorStandard from '@/features/sponsors/components/SponsorStandard';

import { type CategoriaServicio, Comuna, type Service } from '@/shared/types/common';

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
    initialComuna: string;
    sponsor: Sponsor | null;
    services: Service[];
    categories?: CategoriaServicio[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
}

export default function SearchPageClient({
    initialQuery,
    initialCategory,
    initialComuna,
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

    // States managed locally for inputs, synced with URL on apply
    const [searchQuery, setSearchQuery] = useState<string>(initialQuery || '');
    const [selectedCategories, setSelectedCategories] = useState<string[]>(
        initialCategory && initialCategory !== 'Todos' ? initialCategory.split(',') : ['Todos'],
    );
    const [selectedComuna, setSelectedComuna] = useState<string>(initialComuna || 'Todas');
    const [searchComuna, setSearchComuna] = useState<string>(initialComuna || 'Todas'); // For top bar select

    // Sync state with props when navigation happens
    useEffect(() => {
        setSearchQuery(initialQuery || '');
        setSelectedCategories(
            initialCategory && initialCategory !== 'Todos' ? initialCategory.split(',') : ['Todos'],
        );
        setSelectedComuna(initialComuna || 'Todas');
        setSearchComuna(initialComuna || 'Todas');
    }, [initialQuery, initialCategory, initialComuna]);

    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Lógica de filtrado necesaria
    const updateFilters = (newParams: Record<string, string | number | undefined>) => {
        const params = new URLSearchParams();
        if (searchQuery) params.set('q', searchQuery);

        // Merge current states with new params overrides
        const category =
            newParams.c !== undefined ? String(newParams.c) : selectedCategories.join(',');
        const comuna = newParams.comuna !== undefined ? newParams.comuna : selectedComuna;
        const page = newParams.page !== undefined ? newParams.page : 1;

        if (category && category !== 'Todos') params.set('c', category);
        if (comuna && comuna !== 'Todas') params.set('comuna', String(comuna));
        if (page && Number(page) > 1) params.set('page', String(page));

        router.push(`/buscar?${params.toString()}`, { scroll: true });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // When searching from top bar, we sync the comuna select there with the main filter
        setSelectedComuna(searchComuna);
        updateFilters({ q: searchQuery, comuna: searchComuna, page: 1 });
    };

    const handleCategoryChange = (category: string) => {
        let newCategories: string[];

        if (category === 'Todos') {
            newCategories = ['Todos'];
        } else {
            const current = selectedCategories.filter((c) => c !== 'Todos');
            if (current.includes(category)) {
                newCategories = current.filter((c) => c !== category);
            } else {
                newCategories = [...current, category];
            }

            if (newCategories.length === 0) {
                newCategories = ['Todos'];
            }
        }

        setSelectedCategories(newCategories);
        updateFilters({ c: newCategories.join(','), page: 1 });
    };

    const handleComunaChange = (comuna: string) => {
        setSelectedComuna(comuna);
        // Also sync the search bar comuna
        setSearchComuna(comuna);
        updateFilters({ comuna: comuna, page: 1 });
    };

    const handlePageChange = (page: number) => {
        updateFilters({ page });
    };

    const resetFilters = () => {
        setSearchQuery('');
        setSearchComuna('Todas');
        setSelectedCategories(['Todos']);
        setSelectedComuna('Todas');
        router.push('/buscar');
    };

    // Mostrar solo las primeras 20 categorías inicialmente
    const INITIAL_CATEGORIES_LIMIT = 20;
    const visibleCategories = showAllCategories
        ? categories
        : categories.slice(0, INITIAL_CATEGORIES_LIMIT);
    const hasMoreCategories = categories.length > INITIAL_CATEGORIES_LIMIT;

    return (
        <section className="bg-background min-h-screen py-10 pb-20 transition-colors duration-300">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
                                className="cursor-pointer text-xs font-bold text-blue-600 hover:underline dark:text-blue-400"
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
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-800 dark:checked:bg-blue-600"
                                            checked={selectedCategories.includes('Todos')}
                                            onChange={() => handleCategoryChange('Todos')}
                                        />
                                        <span
                                            className={`text-sm ${selectedCategories.includes('Todos') ? 'font-bold text-blue-600 dark:text-blue-400' : 'text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200'}`}
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
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-800 dark:checked:bg-blue-600"
                                                checked={
                                                    selectedCategories.includes(cat.id) ||
                                                    selectedCategories.includes(cat.nombre)
                                                }
                                                onChange={() => handleCategoryChange(cat.id)}
                                            />
                                            <span
                                                className={`text-sm ${selectedCategories.includes(cat.id) || selectedCategories.includes(cat.nombre) ? 'font-bold text-blue-600 dark:text-blue-400' : 'text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200'}`}
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

                            <div>
                                <h3 className="mb-4 text-xs font-bold tracking-widest text-gray-500 uppercase dark:text-gray-500">
                                    Comuna
                                </h3>
                                <select
                                    className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 dark:border-white/10 dark:bg-gray-900 dark:text-white"
                                    value={selectedComuna}
                                    onChange={(e) => handleComunaChange(e.target.value)}
                                >
                                    <option value="Todas" className="dark:bg-gray-900">
                                        Todas las comunas
                                    </option>
                                    {Object.values(Comuna).map((c) => (
                                        <option key={c} value={c} className="dark:bg-gray-900">
                                            {c}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* SPONSOR STANDARD - Random de sponsors de la categoría */}
                            <SponsorStandard sponsor={sponsor} />
                        </div>

                        {showFilters && (
                            <button
                                type="button"
                                onClick={() => setShowFilters(false)}
                                className="mt-8 w-full cursor-pointer rounded-xl bg-blue-600 py-3 font-bold text-white shadow-lg"
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
                                className="flex flex-col items-stretch overflow-hidden rounded-2xl border border-gray-100 bg-white p-2 shadow-xl shadow-blue-900/5 md:flex-row md:items-center dark:border-white/10 dark:bg-gray-900/40 dark:backdrop-blur-xl"
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

                                <div className="flex items-center gap-2 border-t border-gray-100 px-4 py-3 md:border-t-0 md:border-l dark:border-white/10">
                                    <MapPin
                                        className="text-blue-600 dark:text-blue-400"
                                        size={18}
                                    />
                                    <select
                                        aria-label="Filtrar por comuna"
                                        value={searchComuna}
                                        onChange={(e) =>
                                            setSearchComuna(e.target.value as Comuna | 'Todas')
                                        }
                                        className="border-none bg-transparent text-sm font-medium text-gray-700 outline-none focus:ring-0 dark:text-white"
                                    >
                                        <option value="Todas" className="dark:bg-gray-900">
                                            Todas las comunas
                                        </option>
                                        {Object.values(Comuna).map((comuna) => (
                                            <option
                                                key={comuna}
                                                value={comuna}
                                                className="dark:bg-gray-900"
                                            >
                                                {comuna}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    className="m-1 cursor-pointer rounded-xl bg-blue-600 px-8 py-3 font-bold text-white transition-all hover:bg-blue-700 dark:shadow-none"
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
                                        <ServiceCard key={service.id} service={service} />
                                    ))}
                                </div>

                                {/* Paginación */}
                                {totalPages > 1 && (
                                    <div className="mt-12 flex justify-center">
                                        <nav className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handlePageChange(Math.max(1, currentPage - 1))
                                                }
                                                disabled={currentPage === 1}
                                                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                                                aria-label="Página anterior"
                                            >
                                                <span className="sr-only">Anterior</span>
                                                <svg
                                                    className="h-5 w-5"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <title>Anterior</title>
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M15 19l-7-7 7-7"
                                                    />
                                                </svg>
                                            </button>

                                            {/* Generar números de página */}
                                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                                .filter((page) => {
                                                    // Mostrar primera, última, actual y adyacentes
                                                    return (
                                                        page === 1 ||
                                                        page === totalPages ||
                                                        Math.abs(page - currentPage) <= 1
                                                    );
                                                })
                                                .map((page, index, array) => {
                                                    // Agregar elipses si hay saltos
                                                    const prevPage = array[index - 1];
                                                    const showEllipsis =
                                                        prevPage && page - prevPage > 1;

                                                    return (
                                                        <div
                                                            key={page}
                                                            className="flex items-center gap-2"
                                                        >
                                                            {showEllipsis && (
                                                                <span className="px-1 text-gray-400">
                                                                    ...
                                                                </span>
                                                            )}
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handlePageChange(page)
                                                                }
                                                                className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border transition-colors ${
                                                                    currentPage === page
                                                                        ? 'border-blue-600 bg-blue-600 font-bold text-white shadow-md dark:border-blue-500 dark:bg-blue-500'
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
                                                onClick={() =>
                                                    handlePageChange(
                                                        Math.min(totalPages, currentPage + 1),
                                                    )
                                                }
                                                disabled={currentPage === totalPages}
                                                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                                                aria-label="Página siguiente"
                                            >
                                                <span className="sr-only">Siguiente</span>
                                                <svg
                                                    className="h-5 w-5"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <title>Siguiente</title>
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M9 5l7 7-7 7"
                                                    />
                                                </svg>
                                            </button>
                                        </nav>
                                    </div>
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
                                    className="mt-6 cursor-pointer font-bold text-blue-600 hover:underline dark:text-blue-400"
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
