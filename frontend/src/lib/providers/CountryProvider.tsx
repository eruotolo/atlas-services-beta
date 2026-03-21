'use client';

import { createContext, useContext } from 'react';

export interface CountryConfig {
    code: string;
    name: string;
    currency: string;
    locale: string;
    timezone: string;
    gateway: 'MERCADOPAGO' | 'STRIPE';
    regionLabel: string;
    localityLabel: string;
}

const CountryContext = createContext<CountryConfig | null>(null);

export function CountryProvider({
    children,
    countryConfig,
}: {
    children: React.ReactNode;
    countryConfig: CountryConfig;
}) {
    return <CountryContext.Provider value={countryConfig}>{children}</CountryContext.Provider>;
}

export function useCountry(): CountryConfig {
    const ctx = useContext(CountryContext);
    if (!ctx) throw new Error('useCountry must be used inside CountryProvider');
    return ctx;
}
