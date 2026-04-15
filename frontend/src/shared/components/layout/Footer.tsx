'use client';

import { useState } from 'react';

import type React from 'react';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

import { FaHeart, FaInstagram, FaWhatsapp, FaYoutube } from 'react-icons/fa';

import { useDictionary } from '@/lib/i18n/useDictionary';

import Logo from './Logo';

const COUNTRY_OPTIONS = [
    { code: 'cl', flag: '🇨🇱', name: 'Chile' },
    { code: 'ar', flag: '🇦🇷', name: 'Argentina' },
    { code: 'uy', flag: '🇺🇾', name: 'Uruguay' },
    { code: 'es', flag: '🇪🇸', name: 'España' },
    { code: 'us', flag: '🇺🇸', name: 'United States' },
] as const;

const Footer: React.FC = () => {
    const params = useParams();
    const router = useRouter();
    const country = (params?.country as string) ?? 'cl';
    const dict = useDictionary();
    const [showCountryMenu, setShowCountryMenu] = useState(false);

    const currentCountry = COUNTRY_OPTIONS.find((o) => o.code === country) ?? COUNTRY_OPTIONS[0];

    function handleCountryChange(newCountry: string): void {
        // biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API no disponible en todos los navegadores
        document.cookie = `atlas_country=${newCountry}; path=/; max-age=31536000; SameSite=Lax`;
        setShowCountryMenu(false);
        router.push(`/${newCountry}`);
    }

    return (
        <footer className="border-border bg-background border-t pt-16 pb-8">
            <div className="mx-auto max-w-site px-4 sm:px-6 lg:px-8">
                <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-4">
                    <div className="col-span-1 md:col-span-1">
                        <div className="mb-6 opacity-80 transition-opacity hover:opacity-100">
                            <Logo className="h-10 w-auto" />
                        </div>
                        <p className="pr-4 text-sm leading-relaxed text-gray-600 dark:text-gray-500">
                            {dict.footer.tagline}
                        </p>

                        <div className="mt-6 flex gap-4">
                            <a
                                href="https://www.instagram.com/atlasservicios/"
                                className="text-gray-400 transition-colors hover:text-brand dark:hover:text-brand-light"
                                target="_blank"
                                rel="noopener"
                            >
                                <FaInstagram size={20} />
                            </a>
                            <a
                                href="https://wa.me/56929540906?text=Hola,%20que%20tal?"
                                className="text-gray-400 transition-colors hover:text-green-600 dark:hover:text-green-400"
                                aria-label="WhatsApp"
                                target="_blank"
                                rel="noopener"
                            >
                                <FaWhatsapp size={20} />
                            </a>
                            <a
                                href="https://www.youtube.com/@AtlasServicios"
                                className="text-gray-400 transition-colors hover:text-red-600 dark:hover:text-red-400"
                                aria-label="YouTube"
                                target="_blank"
                                rel="noopener"
                            >
                                <FaYoutube size={20} />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 className="mb-6 text-xs font-bold tracking-widest text-brand text-gray-900 uppercase dark:text-gray-100">
                            {dict.footer.platform}
                        </h4>
                        <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-500">
                            <li>
                                <Link
                                    href={`/${country}/quienes-somos`}
                                    className="font-medium transition-colors hover:text-brand dark:hover:text-brand-light"
                                >
                                    {dict.footer.aboutUs}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={`/${country}/como-funciona`}
                                    className="font-medium transition-colors hover:text-brand dark:hover:text-brand-light"
                                >
                                    {dict.footer.howItWorks}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={`/${country}/publicar`}
                                    className="font-medium transition-colors hover:text-brand dark:hover:text-brand-light"
                                >
                                    {dict.footer.publishService}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={`/${country}/suscripcion-pro`}
                                    className="font-medium transition-colors hover:text-brand dark:hover:text-brand-light"
                                >
                                    {dict.footer.proSubscriptions}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="mb-6 text-xs font-bold tracking-widest text-brand text-gray-900 uppercase dark:text-gray-100">
                            {dict.footer.support}
                        </h4>
                        <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-500">
                            <li>
                                <Link
                                    href={`/${country}/ayuda`}
                                    className="font-medium transition-colors hover:text-brand dark:hover:text-brand-light"
                                >
                                    {dict.footer.helpCenter}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={`/${country}/terminos`}
                                    className="font-medium transition-colors hover:text-brand dark:hover:text-brand-light"
                                >
                                    {dict.footer.terms}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={`/${country}/privacidad`}
                                    className="font-medium transition-colors hover:text-brand dark:hover:text-brand-light"
                                >
                                    {dict.footer.privacy}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={`/${country}/contacto`}
                                    className="font-medium transition-colors hover:text-brand dark:hover:text-brand-light"
                                >
                                    {dict.footer.contact}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className="border-border bg-muted rounded-[2rem] border p-6">
                        <h4 className="mb-4 text-sm font-bold text-brand-marino italic dark:text-brand-light">
                            {dict.footer.proCalloutTitle}
                        </h4>
                        <p className="mb-4 text-xs leading-relaxed text-brand-hover dark:text-brand-light">
                            {dict.footer.proCalloutDesc}
                        </p>
                        <Link
                            href={`/${country}/publicar`}
                            className="text-[10px] font-black tracking-tighter text-brand uppercase hover:underline dark:text-brand-light"
                        >
                            {dict.footer.proCalloutCta}
                        </Link>
                    </div>
                </div>

                <div className="border-border flex flex-col items-center justify-between gap-4 border-t pt-8 text-[10px] font-bold tracking-widest text-gray-500 uppercase md:flex-row dark:text-gray-600">
                    <p>
                        {dict.footer.rights} © 2026{' '}
                        <a
                            href="https://crowadvance.com/"
                            target="_blank"
                            rel="noopener"
                            className="hover:text-brand dark:hover:text-brand-light"
                        >
                            Crow Advance
                        </a>
                    </p>


                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setShowCountryMenu((prev) => !prev)}
                            className="flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1 transition-colors hover:text-brand dark:hover:text-brand-light"
                            aria-label={dict.footer.changeCountry}
                        >
                            <span>{currentCountry.flag}</span>
                            <span>{currentCountry.name}</span>
                            <span className="text-[8px]">▾</span>
                        </button>

                        {showCountryMenu && (
                            <ul className="bg-background border-border absolute right-0 bottom-full mb-2 w-40 overflow-hidden rounded-xl border shadow-lg">
                                {COUNTRY_OPTIONS.map((opt) => (
                                    <li key={opt.code}>
                                        <button
                                            type="button"
                                            onClick={() => handleCountryChange(opt.code)}
                                            className={`flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-xs normal-case tracking-normal transition-colors hover:bg-brand/5 dark:hover:bg-gray-800 ${
                                                opt.code === country
                                                    ? 'font-black text-brand dark:text-brand-light'
                                                    : 'font-medium text-gray-700 dark:text-gray-300'
                                            }`}
                                        >
                                            <span>{opt.flag}</span>
                                            <span>{opt.name}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
