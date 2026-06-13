'use client';

import { useMemo, useTransition, type ReactElement, type ReactNode } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import type { Country } from '@/features/geo/types/geoTypes';
import { CountryProvider, type CountryConfig } from '@/lib/providers/CountryProvider';
import { Mono, Select } from '@/shared/components/hireeo';

interface CountryScopeSelectorProps {
    countries: Country[];
    defaultCode?: string;
    subtitle?: string;
    children: ReactNode;
}

// Config de respaldo si la tabla de países está vacía (evita romper los forms)
const FALLBACK_CONFIG: CountryConfig = {
    code: 'cl',
    name: 'Chile',
    currency: 'CLP',
    locale: 'es-CL',
    timezone: 'America/Santiago',
    gateway: 'MERCADOPAGO',
    regionLabel: 'Región',
    localityLabel: 'Comuna',
    paymentsEnabled: true,
};

function toCountryConfig(country: Country): CountryConfig {
    return {
        code: country.code,
        name: country.name,
        currency: country.currency,
        locale: country.locale,
        timezone: country.timezone,
        gateway: country.gateway,
        regionLabel: country.regionLabel,
        localityLabel: country.localityLabel,
        paymentsEnabled: country.paymentsEnabled,
    };
}

/**
 * Selector de "país de trabajo" para el panel global /config.
 * Sincroniza `?country=` en la URL (la página filtra server-side con ese valor)
 * y provee CountryProvider a los formularios que necesitan contexto de país.
 */
export function CountryScopeSelector({
    countries,
    defaultCode = 'cl',
    subtitle = 'Filtra los datos mostrados y define el país al crear o editar registros',
    children,
}: CountryScopeSelectorProps): ReactElement {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const code = countries.some((c) => c.code === defaultCode)
        ? defaultCode
        : (countries[0]?.code ?? defaultCode);

    const config = useMemo(() => {
        const selected = countries.find((c) => c.code === code);
        return selected ? toCountryConfig(selected) : FALLBACK_CONFIG;
    }, [countries, code]);

    function handleChange(nextCode: string): void {
        const params = new URLSearchParams(searchParams.toString());
        params.set('country', nextCode);
        params.delete('page');
        startTransition(() => {
            router.replace(`${pathname}?${params.toString()}`);
        });
    }

    return (
        <CountryProvider countryConfig={config}>
            {countries.length > 0 && (
                <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-line bg-bg/60 px-5 py-4 shadow-sm backdrop-blur-md dark:bg-tint/40">
                    <div>
                        <Mono className="text-[10px] font-semibold tracking-[0.08em] text-muted uppercase">
                            País de trabajo
                        </Mono>
                        <p className="mt-0.5 text-[11px] text-sub">{subtitle}</p>
                    </div>
                    <div className="w-48 shrink-0">
                        <Select
                            icon="globe"
                            value={code}
                            onChange={(event) => handleChange(event.target.value)}
                            disabled={isPending}
                            aria-label="País de trabajo"
                        >
                            {countries.map((country) => (
                                <option key={country.code} value={country.code}>
                                    {country.name}
                                </option>
                            ))}
                        </Select>
                    </div>
                </div>
            )}
            {children}
        </CountryProvider>
    );
}
