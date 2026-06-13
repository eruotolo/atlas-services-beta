/**
 * Filtro Prisma reutilizable para entidades que llegan al país vía su relación
 * `service` (ratings, interactions, subscriptions). Retorna {} si no hay código.
 */
export function whereServiceCountry(countryCode?: string): {
    service?: { country: { code: string } };
} {
    if (!countryCode) return {};
    return { service: { country: { code: countryCode.toLowerCase() } } };
}
