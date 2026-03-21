'use client';

import { useRouter } from 'next/navigation';

import { useCountry } from '@/lib/providers/CountryProvider';

const COUNTRY_OPTIONS = [
    { code: 'cl', flag: '🇨🇱', name: 'Chile' },
    { code: 'ar', flag: '🇦🇷', name: 'Argentina' },
    { code: 'uy', flag: '🇺🇾', name: 'Uruguay' },
    { code: 'es', flag: '🇪🇸', name: 'España' },
    { code: 'us', flag: '🇺🇸', name: 'United States' },
] as const;

export function CountrySwitcher() {
    const country = useCountry();
    const router = useRouter();

    function handleChange(newCountry: string) {
        // biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API no disponible en todos los navegadores
        document.cookie = `atlas_country=${newCountry}; path=/; max-age=31536000; SameSite=Lax`;
        router.push(`/${newCountry}`);
    }

    return (
        <select
            aria-label="Seleccionar país"
            value={country.code}
            onChange={(e) => handleChange(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 dark:border-white/10 dark:bg-gray-900 dark:text-white"
        >
            {COUNTRY_OPTIONS.map((opt) => (
                <option key={opt.code} value={opt.code}>
                    {opt.flag} {opt.name}
                </option>
            ))}
        </select>
    );
}
