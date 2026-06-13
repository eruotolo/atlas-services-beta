'use client';

import { useRouter } from 'next/navigation';
import type { ReactElement } from 'react';

import { Mono } from '@/shared/components/hireeo';

const COUNTRIES = [
    { code: 'cl', name: 'Chile', flag: '🇨🇱' },
    { code: 'ar', name: 'Argentina', flag: '🇦🇷' },
    { code: 'uy', name: 'Uruguay', flag: '🇺🇾' },
    { code: 'es', name: 'España', flag: '🇪🇸' },
    { code: 'us', name: 'United States', flag: '🇺🇸' },
] as const;

interface Props {
    currentCountry: string;
    label: string;
}

export function HeroCountrySelector({ currentCountry, label }: Props): ReactElement {
    const router = useRouter();

    const handleCountryChange = (code: string) => {
        // Guardamos la preferencia y redirigimos
        document.cookie = `hireeo_country=${code}; path=/; max-age=31536000; SameSite=Lax`;
        router.push(`/${code}`);
    };

    return (
        <div className="mt-16 flex flex-wrap items-center gap-5">
            <Mono
                className="text-[11px] font-semibold"
                style={{ color: 'var(--sub)', letterSpacing: '0.15em' }}
            >
                {label}
            </Mono>
            <div className="flex flex-wrap items-center gap-2">
                {COUNTRIES.map((c) => {
                    const isActive = currentCountry === c.code;
                    return (
                        <button
                            key={c.code}
                            type="button"
                            onClick={() => handleCountryChange(c.code)}
                            className={`flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 transition-all hover:bg-black/5 dark:hover:bg-white/5 ${
                                isActive ? 'bg-black/5 ring-1 ring-black/10 dark:bg-white/10 dark:ring-white/20' : ''
                            }`}
                        >
                            <span className="text-lg leading-none">{c.flag}</span>
                            <span
                                className="text-[13px] font-medium transition-colors"
                                style={{ color: isActive ? 'var(--ink)' : 'var(--sub)' }}
                            >
                                {c.name}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
