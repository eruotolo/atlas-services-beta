/**
 * Helper puro para construir el título y breadcrumb de la pantalla Buscar.
 * Usado por:
 *  - ResultsHeader (Client Component) para h1/breadcrumb dinámicos
 *  - page.tsx (Server Component) para generateMetadata
 */

interface BuildSearchTitleInput {
    categoryNames: readonly string[];
    localityName: string | null;
    regionName: string | null;
    countryName: string;
    defaultTitle: string;
    prepositionIn: string;
    multipleCategoriesSuffix: string;
}

function isOnlyTodos(categoryNames: readonly string[]): boolean {
    return (
        categoryNames.length === 0 ||
        (categoryNames.length === 1 && categoryNames[0] === 'Todos')
    );
}

export function buildSearchTitle({
    categoryNames,
    localityName,
    regionName,
    countryName,
    defaultTitle,
    prepositionIn,
    multipleCategoriesSuffix,
}: BuildSearchTitleInput): string {
    const place = localityName ?? regionName ?? countryName;

    if (isOnlyTodos(categoryNames)) {
        return `${defaultTitle} ${prepositionIn} ${place}`;
    }

    if (categoryNames.length === 1) {
        return `${categoryNames[0]} ${prepositionIn} ${place}`;
    }

    return `${categoryNames.length} ${multipleCategoriesSuffix} ${prepositionIn} ${place}`;
}

export function parseCategoryParam(categoryParam: string): readonly string[] {
    if (!categoryParam || categoryParam === 'Todos') return [];
    return categoryParam
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
}
