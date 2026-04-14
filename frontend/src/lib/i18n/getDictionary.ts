import { enUS } from './dictionaries/en-US';
import { es } from './dictionaries/es';
import { esAR } from './dictionaries/es-AR';
import { esCL } from './dictionaries/es-CL';
import { esES } from './dictionaries/es-ES';
import { esUY } from './dictionaries/es-UY';
import type { DeepPartial, Dictionary } from './types';

// biome-ignore lint/suspicious/noExplicitAny: Required for recursive deep merge over unknown shapes
type AnyObject = Record<string, any>;

function deepMerge(base: AnyObject, overrides: AnyObject): AnyObject {
    const result: AnyObject = { ...base };
    for (const key of Object.keys(overrides)) {
        const override = overrides[key];
        if (override === undefined) continue;
        const baseVal = result[key];
        if (override !== null && typeof override === 'object' && !Array.isArray(override)) {
            result[key] = deepMerge(baseVal as AnyObject, override as AnyObject);
        } else {
            result[key] = override;
        }
    }
    return result;
}

const spanishOverrides: Record<string, DeepPartial<Dictionary>> = {
    cl: esCL,
    ar: esAR,
    uy: esUY,
    es: esES,
};

export function getDictionary(country: string): Dictionary {
    if (country === 'us') return enUS;
    const overrides = spanishOverrides[country] ?? {};
    return deepMerge(es, overrides) as Dictionary;
}
