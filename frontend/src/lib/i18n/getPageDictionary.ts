/**
 * Loads page-specific translations based on country code.
 * Spanish is the base for all non-US countries.
 * US gets English (en.json), all others get Spanish (es.json).
 */
export function getPageDictionary<T>(page: string, country: string): T {
    if (country === 'us') {
        // biome-ignore lint/suspicious/noExplicitAny: Dynamic JSON import required
        return (require(`./pages/${page}/en.json`) as any) as T;
    }
    // biome-ignore lint/suspicious/noExplicitAny: Dynamic JSON import required
    return (require(`./pages/${page}/es.json`) as any) as T;
}
