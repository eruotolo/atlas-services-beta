// Maps category slug → SF Symbol name (iOS), emoji fallback (Android) and Icon component name
interface CategorySymbol {
    readonly symbol: string;
    readonly fallback: string;
    readonly iconName: string; // key in shared/components/Icon ICONS map
}

const SYMBOL_MAP: Readonly<Record<string, CategorySymbol>> = {
    electricidad:  { symbol: 'bolt.fill',        fallback: '⚡',  iconName: 'bolt' },
    electric:      { symbol: 'bolt.fill',        fallback: '⚡',  iconName: 'bolt' },
    plomeria:      { symbol: 'drop.fill',        fallback: '💧',  iconName: 'drop' },
    plumbing:      { symbol: 'drop.fill',        fallback: '💧',  iconName: 'drop' },
    carpinteria:   { symbol: 'hammer.fill',      fallback: '🔨',  iconName: 'hammer' },
    carpentry:     { symbol: 'hammer.fill',      fallback: '🔨',  iconName: 'hammer' },
    limpieza:      { symbol: 'sparkles',         fallback: '✨',  iconName: 'sparkles' },
    cleaning:      { symbol: 'sparkles',         fallback: '✨',  iconName: 'sparkles' },
    pintura:       { symbol: 'paintbrush.fill',  fallback: '🖌️', iconName: 'paint' },
    painting:      { symbol: 'paintbrush.fill',  fallback: '🖌️', iconName: 'paint' },
    mudanzas:      { symbol: 'shippingbox.fill', fallback: '📦',  iconName: 'tools' },
    fletes:        { symbol: 'shippingbox.fill', fallback: '📦',  iconName: 'tools' },
    jardineria:    { symbol: 'leaf.fill',        fallback: '🌿',  iconName: 'sparkles' },
    gardening:     { symbol: 'leaf.fill',        fallback: '🌿',  iconName: 'sparkles' },
};

const DEFAULT_SYMBOL: CategorySymbol = { symbol: 'wrench.and.screwdriver.fill', fallback: '🔧', iconName: 'tools' };

export function getCategorySymbol(slug: string): CategorySymbol {
    return SYMBOL_MAP[slug.toLowerCase()] ?? DEFAULT_SYMBOL;
}
