import Link from 'next/link';

import { ArrowRight, Crown, Megaphone, Sparkles } from 'lucide-react';

import { getTopCategories } from '@/features/categories/actions';
import HeroCategories from '@/features/categories/components/HeroCategories';
import { getRegionsByCountry } from '@/features/geo/actions';
import { COUNTRY_CONFIG, COUNTRY_SEO_CONFIG } from '@/features/geo/lib/countryUtils';
import { getPublicFeaturedServices } from '@/features/services/actions';
import ServiceCard from '@/features/services/components/cards/ServiceCard';
import { getSponsorsPremium, getSponsorsSenior } from '@/features/sponsors/actions';
import SponsorSlider from '@/features/sponsors/components/SponsorSlider';

import type { CategoryIconName } from '@/shared/components/icons/CategoryIcons';
import HomeHeroSection from '@/shared/components/layout/HomeHeroSection';
import { getDictionary } from '@/lib/i18n/getDictionary';
import { mockServices } from '@/shared/lib/mockData';

export default async function CountryHomePage({
    params,
}: {
    params: Promise<{ country: string }>;
}) {
    const { country } = await params;
    const countryName = COUNTRY_SEO_CONFIG[country]?.countryName ?? country.toUpperCase();
    const dict = getDictionary(country);
    const countryLocale = COUNTRY_CONFIG[country]?.locale ?? 'es-CL';
    const serviceLabels = dict.service;

    const [topCategories, regions, realFeaturedServices, sponsorsSenior, sponsorsPremium] =
        await Promise.all([
            getTopCategories(country),
            getRegionsByCountry(country),
            getPublicFeaturedServices(country),
            getSponsorsSenior(country),
            getSponsorsPremium(country),
        ]);

    const heroCategories = topCategories.map((cat) => ({
        name: cat.nombre,
        iconName: (cat.icono as CategoryIconName) || 'Sparkles',
        category: cat.id,
    }));

    const featuredServices =
        realFeaturedServices.length > 0
            ? realFeaturedServices
            : [...mockServices, ...mockServices].slice(0, 8).map((s, i) => ({
                  ...s,
                  id: `mock-${i}`,
              }));

    return (
        <>
            <HomeHeroSection country={country} countryName={countryName} regions={regions} />
            <HeroCategories categories={heroCategories} />

            {sponsorsSenior.length > 0 ? (
                <section className="dark:bg-background w-full bg-white py-10">
                    <div className="container mx-auto max-w-site px-4 sm:px-6 lg:px-8">
                        <SponsorSlider sponsors={sponsorsSenior} showDots variant="senior" />
                    </div>
                </section>
            ) : (
                <section className="dark:bg-background w-full bg-white py-10">
                    <div className="container mx-auto max-w-site px-4">
                        <div className="group flex cursor-pointer flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-brand/20 bg-brand/5/40 px-6 py-[120px] transition-colors hover:bg-brand/5 dark:border-brand-marino/20 dark:bg-brand-marino/10">
                            <Megaphone
                                size={24}
                                className="mb-2 text-brand-light transition-transform group-hover:scale-110 dark:text-brand"
                            />
                            <Link href="contacto" className="text-center">
                                <h2 className="mb-1 text-[10px] font-black tracking-[0.2em] text-brand-marino uppercase dark:text-brand-light">
                                    {dict.home.adSpaceTitle}
                                </h2>
                                <p className="text-xs font-medium text-brand-light dark:text-brand">
                                    {dict.home.adSpaceSubtitle}
                                </p>
                                <p className="mt-4 text-[9px] font-black tracking-widest text-brand uppercase underline dark:text-brand-light">
                                    {dict.home.learnMore}
                                </p>
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            <section className="dark:bg-background w-full bg-white py-12 md:py-20">
                <div className="container mx-auto max-w-site px-4 sm:px-6 lg:px-8">
                    <div className="mb-8 flex flex-col justify-between gap-4 md:mb-12 md:flex-row md:items-end">
                        <div>
                            <span className="mb-2 block text-[10px] font-black tracking-[0.2em] text-brand uppercase dark:text-brand-light">
                                {dict.home.featuredLabel}
                            </span>
                            <h2 className="text-2xl leading-tight font-black text-gray-900 md:text-3xl dark:text-white">
                                {dict.home.featuredTitle}
                            </h2>
                        </div>
                        <Link
                            href="buscar"
                            className="flex items-center gap-1 text-sm font-bold text-brand hover:underline dark:text-brand-light"
                        >
                            {dict.home.viewAll} <span className="text-lg">→</span>
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {featuredServices.map((service) => (
                            <ServiceCard
                                key={service.id}
                                service={service}
                                labels={serviceLabels}
                                locale={countryLocale}
                            />
                        ))}
                    </div>
                </div>
            </section>

            <section className="dark:bg-background w-full bg-white py-6 md:py-10">
                <div className="container mx-auto max-w-site px-4 sm:px-6 lg:px-8">
                    <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-brand to-brand-hover p-6 text-white shadow-2xl shadow-brand-marino/20 md:rounded-[3rem] md:p-12 dark:from-brand-hover dark:to-brand-marino">
                        <div className="absolute top-0 right-0 hidden translate-x-10 -translate-y-10 -rotate-12 p-12 opacity-10 md:block">
                            <Crown size={240} />
                        </div>
                        <div className="relative z-10 flex flex-col items-center justify-between gap-8 md:flex-row">
                            <div className="max-w-xl text-center md:text-left">
                                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-[9px] font-black tracking-widest uppercase md:mb-6 md:text-[10px]">
                                    <Sparkles size={14} /> {dict.home.proCtaTag}
                                </div>
                                <h2 className="mb-4 text-2xl leading-tight font-black md:text-4xl">
                                    {dict.home.proCtaTitle}
                                </h2>
                                <p className="text-base leading-relaxed font-medium text-brand/20 opacity-90 md:text-lg">
                                    {dict.home.proCtaDescription}
                                </p>
                            </div>
                            <div className="w-full shrink-0 md:w-auto">
                                <Link
                                    href="suscripcion-pro"
                                    className="flex items-center justify-center gap-3 rounded-2xl border border-white/40 bg-white/15 px-8 py-4 text-base font-black text-white backdrop-blur-sm transition-all duration-300 hover:bg-white hover:text-brand-marino active:opacity-90 md:rounded-[2rem] md:px-10 md:py-5 md:text-lg"
                                >
                                    {dict.home.proCtaButton} <ArrowRight size={20} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="dark:bg-background border-y border-gray-100 bg-gray-50 py-12 md:py-20 dark:border-gray-800">
                <div className="container mx-auto max-w-site px-4 sm:px-6 lg:px-8">
                    <div className="mb-8 flex items-center gap-2 md:mb-10">
                        <Megaphone className="text-brand dark:text-brand-light" size={20} />
                        <h2 className="text-[10px] font-black tracking-[0.25em] text-gray-400 uppercase dark:text-gray-500">
                            {dict.home.communityAdsTitle}
                        </h2>
                    </div>

                    {sponsorsPremium.length > 0 ? (
                        <SponsorSlider
                            sponsors={sponsorsPremium.slice(0, 6)}
                            showDots
                            variant="premium"
                        />
                    ) : (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {Array.from({ length: 2 }).map((_, i) => (
                                <div
                                    // biome-ignore lint/suspicious/noArrayIndexKey: Array estático de placeholders
                                    key={i}
                                    className="group flex cursor-pointer flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-brand/20 bg-brand/5/40 px-6 py-12 transition-colors hover:bg-brand/5 dark:border-brand-marino/20 dark:bg-brand-marino/10"
                                >
                                    <Megaphone
                                        size={24}
                                        className="mb-2 text-brand-light transition-transform group-hover:scale-110 dark:text-brand"
                                    />
                                    <Link href="contacto" className="text-center">
                                        <h3 className="mb-1 text-[10px] font-black tracking-[0.2em] text-brand-marino uppercase dark:text-brand-light">
                                            {dict.home.adSpaceTitle}
                                        </h3>
                                        <p className="text-xs font-medium text-brand-light dark:text-brand">
                                            {dict.home.adSpaceSubtitle}
                                        </p>
                                        <p className="mt-4 text-[9px] font-black tracking-widest text-brand uppercase underline dark:text-brand-light">
                                            {dict.home.learnMore}
                                        </p>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-12 text-center">
                        <Link
                            href="contacto"
                            className="btn-primary inline-block rounded-2xl px-8 py-4 text-sm"
                        >
                            {dict.home.contactCta}
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
