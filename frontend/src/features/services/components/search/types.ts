/**
 * Tipos compartidos del feature Buscar (UI side).
 * Los filtros server-side (categoría, región, localidad) se sincronizan con la URL
 * vía Server Action. Los filtros client-side (rating, verification, price, availability)
 * se aplican localmente sobre la página actual hasta que el backend los soporte.
 */

export type AvailabilityFilter = 'any' | 'today' | 'tomorrow' | 'thisWeek' | 'twoWeeks';
export type RatingFilter = 'any' | 'r45' | 'r40' | 'r35';
export type VerificationFilter = 'any' | 'verified' | 'pro' | 'top';
export type SortOption = 'rating' | 'nearest' | 'priceAsc' | 'priceDesc';

export interface ClientFilters {
    availability: AvailabilityFilter;
    rating: RatingFilter;
    verification: VerificationFilter;
    priceMin: number | null;
    priceMax: number | null;
    sort: SortOption;
}

export const DEFAULT_CLIENT_FILTERS: ClientFilters = {
    availability: 'any',
    rating: 'any',
    verification: 'any',
    priceMin: null,
    priceMax: null,
    sort: 'rating',
};
