'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import type { ReactElement } from 'react';

import { useCountryLink } from '@/features/geo/hooks/useCountryLink';
import type { Dictionary } from '@/lib/i18n/types';
import { useDictionary } from '@/lib/i18n/useDictionary';
import { Mono, SectionLabel } from '@/shared/components/hireeo';

import Logo from './Logo';

const COUNTRY_OPTIONS = [
    { code: 'cl', name: 'Chile' },
    { code: 'ar', name: 'Argentina' },
    { code: 'uy', name: 'Uruguay' },
    { code: 'es', name: 'España' },
    { code: 'us', name: 'United States' },
] as const;

interface FooterColumnProps {
    title: string;
    links: ReadonlyArray<{ label: string; href?: string; onClick?: () => void; active?: boolean }>;
}

function FooterColumn({ title, links }: FooterColumnProps): ReactElement {
    return (
        <div>
            <SectionLabel className="mb-3.5">{title}</SectionLabel>
            <ul className="m-0 list-none space-y-2.5 p-0">
                {links.map((l) => (
                    <li key={l.label}>
                        {l.href ? (
                            <Link
                                href={l.href}
                                className="text-[13.5px] transition-colors hover:opacity-80"
                                style={{
                                    color: l.active ? 'var(--ink)' : 'var(--sub)',
                                    fontWeight: l.active ? 600 : 500,
                                }}
                            >
                                {l.label}
                            </Link>
                        ) : (
                            <button
                                type="button"
                                onClick={l.onClick}
                                className="cursor-pointer bg-transparent p-0 text-left text-[13.5px] transition-colors hover:opacity-80"
                                style={{
                                    color: l.active ? 'var(--ink)' : 'var(--sub)',
                                    fontWeight: l.active ? 600 : 500,
                                    fontFamily: 'inherit',
                                }}
                            >
                                {l.label}
                            </button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

function buildProductLinks(link: (path: string) => string, dict: Dictionary): FooterColumnProps['links'] {
    return [
        { label: dict.nav.search, href: link('/search') },
        { label: dict.footer.howItWorks, href: link('/how-it-works') },
        { label: dict.footer.proSubscriptions, href: link('/pricing') },
        { label: dict.footer.businesses, href: link('/contact') },
        { label: dict.footer.api, href: link('/contact') },
    ];
}

function buildResourceLinks(link: (path: string) => string, dict: Dictionary): FooterColumnProps['links'] {
    return [
        { label: dict.footer.helpCenter, href: link('/help') },
        { label: dict.footer.documentation, href: link('/help') },
        { label: dict.footer.changelog, href: link('/help') },
        { label: dict.footer.blog, href: link('/help') },
        { label: dict.footer.statusPage, href: link('/help') },
    ];
}

function buildCompanyLinks(link: (path: string) => string, dict: Dictionary): FooterColumnProps['links'] {
    return [
        { label: dict.footer.aboutUs, href: link('/about-us') },
        { label: dict.footer.careers, href: link('/about-us') },
        { label: dict.footer.press, href: link('/about-us') },
        { label: dict.footer.contact, href: link('/contact') },
    ];
}

const Footer: React.FC = (): ReactElement => {
    const params = useParams();
    const router = useRouter();
    const country = (params?.country as string) ?? 'cl';
    const dict = useDictionary();
    const link = useCountryLink();

    function handleCountryChange(newCountry: string): void {
        // biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API no disponible en todos los navegadores
        document.cookie = `hireeo_country=${newCountry}; path=/; max-age=31536000; SameSite=Lax`;
        router.push(`/${newCountry}`);
    }

    const countryLinks: FooterColumnProps['links'] = COUNTRY_OPTIONS.map((opt) => ({
        label: opt.name,
        onClick: () => handleCountryChange(opt.code),
        active: opt.code === country,
    }));

    return (
        <footer
            className="border-t"
            style={{ borderColor: 'var(--line)', background: 'var(--tint)' }}
        >
            <div className="mx-auto max-w-site px-6 pt-16 pb-7 sm:px-10 lg:px-14">
                <div className="mb-11 grid grid-cols-2 gap-10 md:grid-cols-[1.5fr_repeat(4,1fr)]">
                    <div className="col-span-2 md:col-span-1">
                        <div className="mb-4">
                            <Logo className="h-6 w-auto" />
                        </div>
                        <p
                            className="m-0 max-w-[240px] text-[13px] leading-[1.5]"
                            style={{ color: 'var(--sub)' }}
                        >
                            {dict.footer.taglineShort}
                        </p>
                    </div>

                    <FooterColumn
                        title={dict.footer.platform}
                        links={buildProductLinks(link, dict)}
                    />
                    <FooterColumn
                        title={dict.footer.resourcesLabel}
                        links={buildResourceLinks(link, dict)}
                    />
                    <FooterColumn title={dict.footer.countriesLabel} links={countryLinks} />
                    <FooterColumn
                        title={dict.footer.companyLabel}
                        links={buildCompanyLinks(link, dict)}
                    />
                </div>

                <div
                    className="flex flex-col items-start justify-between gap-3 border-t pt-5 text-[12px] md:flex-row md:items-center"
                    style={{ borderColor: 'var(--line)', color: 'var(--sub)' }}
                >
                    <Mono>{dict.footer.copyrightLine}</Mono>
                    <div className="flex flex-wrap items-center gap-5">
                        <Link
                            href={link('/terms')}
                            className="transition-colors hover:opacity-80"
                            style={{ color: 'var(--sub)' }}
                        >
                            {dict.footer.terms}
                        </Link>
                        <Link
                            href={link('/privacy')}
                            className="transition-colors hover:opacity-80"
                            style={{ color: 'var(--sub)' }}
                        >
                            {dict.footer.privacy}
                        </Link>
                        <Link
                            href={link('/privacy')}
                            className="transition-colors hover:opacity-80"
                            style={{ color: 'var(--sub)' }}
                        >
                            {dict.footer.cookies}
                        </Link>
                        <span className="inline-flex items-center gap-1.5">
                            <span
                                aria-hidden
                                className="inline-block h-1.5 w-1.5 rounded-full"
                                style={{ background: 'var(--success)' }}
                            />
                            {dict.footer.systemNormal}
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
