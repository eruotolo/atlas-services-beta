'use client';

import { useRouter } from 'next/navigation';

import { useCountry } from '@/lib/providers/CountryProvider';
import { Select } from '@/shared/components/hireeo';

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
        document.cookie = `hireeo_country=${newCountry}; path=/; max-age=31536000; SameSite=Lax`;
        router.push(`/${newCountry}`);
    }

    return (
        <Select
            icon="globe"
            aria-label="Seleccionar país"
            value={country.code}
            onChange={(e) => handleChange(e.target.value)}
            className="cursor-pointer font-medium"
        >
            {COUNTRY_OPTIONS.map((opt) => (
                <option key={opt.code} value={opt.code}>
                    {opt.flag} {opt.name}
                </option>
            ))}
        </Select>
    );
}
