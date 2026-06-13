import type { Dictionary } from './types';

import ar from './locales/ar.json';
import cl from './locales/cl.json';
import es from './locales/es.json';
import us from './locales/us.json';
import uy from './locales/uy.json';

const DICTS: Record<string, Dictionary> = {
    cl: cl as unknown as Dictionary,
    ar: ar as unknown as Dictionary,
    uy: uy as unknown as Dictionary,
    es: es as unknown as Dictionary,
    us: us as unknown as Dictionary,
};

export function getDictionary(country: string): Dictionary {
    return DICTS[country] ?? DICTS.cl;
}
