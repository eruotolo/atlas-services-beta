'use client';

import { useParams } from 'next/navigation';

import { getDictionary } from './getDictionary';
import type { Dictionary } from './types';

export function useDictionary(): Dictionary {
    const params = useParams();
    const country = (params?.country as string) ?? 'cl';
    return getDictionary(country);
}
