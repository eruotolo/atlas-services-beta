import { notFound } from 'next/navigation';

import type { Metadata } from 'next';

import { getCountryConfig } from '@/features/geo/actions/queries';
import { COUNTRY_SEO_CONFIG } from '@/features/geo/lib/countryUtils';
import { CountryProvider } from '@/lib/providers/CountryProvider';

const VALID_COUNTRIES = ['cl', 'ar', 'uy', 'es', 'us'];

export function generateStaticParams() {
    return VALID_COUNTRIES.map((country) => ({ country }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ country: string }>;
}): Promise<Metadata> {
    const { country } = await params;
    const seo = COUNTRY_SEO_CONFIG[country];
    if (!seo) return {};
    return {
        title: { default: seo.siteName, template: `%s | ${seo.siteName}` },
        description: seo.description,
        other: { 'geo.region': seo.geoRegion, 'DC.language': seo.locale },
        openGraph: { locale: seo.ogLocale },
    };
}

export default async function CountryLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ country: string }>;
}) {
    const { country } = await params;
    if (!VALID_COUNTRIES.includes(country)) notFound();

    const countryConfig = await getCountryConfig(country);
    if (!countryConfig) notFound();

    return <CountryProvider countryConfig={countryConfig}>{children}</CountryProvider>;
}
