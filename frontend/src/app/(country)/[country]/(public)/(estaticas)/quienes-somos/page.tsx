import type React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Anchor, ArrowRight, Heart, MapPin, ShieldCheck, TrendingUp } from 'lucide-react';

import { getPageDictionary } from '@/lib/i18n/getPageDictionary';

interface QuienesSomosDict {
    hero: { badge: string; title: string; highlight: string; subtitle: string };
    story: { label: string; title: string; description: string };
    values: {
        title: string;
        subtitle: string;
        items: Array<{ title: string; desc: string }>;
    };
    stats: {
        label: string;
        title: string;
        description: string;
        items: Array<{ value: string; label: string }>;
        quote: string;
        quoteAuthor: string;
        quoteRole: string;
    };
    cta: { title: string; searchService: string; joinProvider: string };
}

const VALUE_ICONS = [MapPin, ShieldCheck, Heart];
const VALUE_STYLES = [
    { color: 'text-brand dark:text-brand-light', bg: 'bg-brand/5 dark:bg-brand-marino/30' },
    { color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-950/30' },
    { color: 'text-red-500 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/30' },
];

export default async function QuienesSomosPage({
    params,
}: {
    params: Promise<{ country: string }>;
}): Promise<React.ReactElement> {
    const { country } = await params;
    const dict = getPageDictionary<QuienesSomosDict>('quienes-somos', country);

    return (
        <div className="dark:bg-background min-h-screen bg-white pb-20">
            <section className="relative overflow-hidden px-4 py-24">
                <div className="absolute top-0 right-0 h-96 w-96 translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/5 opacity-50 blur-3xl dark:bg-brand-marino/30" />
                <div className="absolute bottom-0 left-0 h-72 w-72 -translate-x-1/3 translate-y-1/3 rounded-full bg-brand/5 opacity-50 blur-3xl dark:bg-brand-marino/30" />
                <div className="relative z-10 mx-auto max-w-4xl text-center">
                    <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-4 py-1.5 text-[10px] font-black tracking-widest text-brand-hover uppercase dark:border-brand-marino/50 dark:bg-brand-marino/50 dark:text-brand-light">
                        <Anchor size={14} /> {dict.hero.badge}
                    </div>
                    <h1 className="mb-8 text-4xl leading-tight font-black tracking-tight text-gray-900 md:text-6xl dark:text-white">
                        {dict.hero.title}{' '}
                        <span className="relative text-brand italic dark:text-brand-light">
                            {dict.hero.highlight}
                            <svg
                                className="absolute -bottom-1 left-0 -z-10 h-3 w-full text-brand-light/60 dark:text-brand-marino/50"
                                viewBox="0 0 100 10"
                                preserveAspectRatio="none"
                            >
                                <title>{dict.hero.highlight}</title>
                                <path
                                    d="M0 5 Q 50 10 100 5"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="none"
                                />
                            </svg>
                        </span>
                    </h1>
                    <p className="mx-auto max-w-2xl text-xl leading-relaxed font-medium text-gray-500 dark:text-gray-400">
                        {dict.hero.subtitle}
                    </p>
                </div>
            </section>

            <section className="mx-auto mb-24 max-w-site px-4 sm:px-6 lg:px-8">
                <div className="relative aspect-[16/9] overflow-hidden rounded-[2.5rem] shadow-2xl md:aspect-[21/9] dark:shadow-black/20">
                    <Image
                        src="/about.png"
                        alt="Hireeo - Profesionales verificados"
                        fill
                        className="object-cover transition-transform duration-1000 hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 1200px"
                    />
                    <div className="absolute inset-0 bg-black/30 transition-opacity dark:bg-black/50" />
                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/90 via-black/30 to-transparent p-8 md:p-16">
                        <div className="max-w-2xl text-white">
                            <span className="mb-4 block text-xs font-black tracking-[0.2em] text-brand-light uppercase">
                                {dict.story.label}
                            </span>
                            <h3 className="mb-6 text-3xl font-black md:text-5xl">{dict.story.title}</h3>
                            <p className="text-base leading-relaxed font-medium text-gray-200 opacity-90 md:text-xl">
                                {dict.story.description}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto mb-24 max-w-site px-4 sm:px-6 lg:px-8">
                <div className="mb-16 text-center">
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white">{dict.values.title}</h2>
                    <p className="mt-2 font-medium text-gray-500 dark:text-gray-400">{dict.values.subtitle}</p>
                </div>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    {dict.values.items.map((val, i) => {
                        const Icon = VALUE_ICONS[i];
                        const style = VALUE_STYLES[i];
                        return (
                            <div
                                key={val.title}
                                className="group dark:bg-card rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-sm transition-all hover:shadow-xl hover:shadow-brand-marino/5 dark:border-white/10 dark:hover:shadow-black/20"
                            >
                                <div
                                    className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl transition-transform group-hover:scale-110 ${style.bg} ${style.color}`}
                                >
                                    <Icon size={32} />
                                </div>
                                <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">
                                    {val.title}
                                </h3>
                                <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                                    {val.desc}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </section>

            <section className="mx-auto mb-24 max-w-site px-4 sm:px-6 lg:px-8">
                <div className="relative overflow-hidden rounded-[3rem] bg-gray-900 py-24 text-white dark:border dark:border-white/10 dark:bg-gray-950">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10">
                        <TrendingUp size={400} strokeWidth={1} />
                    </div>
                    <div className="relative z-10 mx-auto flex max-w-full flex-col items-center justify-between gap-12 px-4 md:flex-row md:px-12">
                        <div className="max-w-xl">
                            <span className="mb-4 block text-xs font-black tracking-[0.2em] text-brand-light uppercase">
                                {dict.stats.label}
                            </span>
                            <h2 className="mb-6 text-4xl font-black">{dict.stats.title}</h2>
                            <p className="mb-8 text-lg leading-relaxed text-gray-300">
                                {dict.stats.description}
                            </p>
                            <div className="flex gap-8">
                                {dict.stats.items.map((stat) => (
                                    <div key={stat.label}>
                                        <p className="text-4xl font-black text-white">{stat.value}</p>
                                        <p className="mt-1 text-xs font-bold tracking-widest text-gray-400 uppercase">
                                            {stat.label}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="max-w-sm rounded-3xl border border-white/10 bg-white/10 p-8 backdrop-blur-md">
                            <div className="mb-4 flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-xl font-bold text-white">
                                    E
                                </div>
                                <div>
                                    <p className="font-bold text-white">{dict.stats.quoteAuthor}</p>
                                    <p className="text-xs text-brand-light/60">{dict.stats.quoteRole}</p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-300 italic">&ldquo;{dict.stats.quote}&rdquo;</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-site px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto">
                    <div className="rounded-[2rem] border border-brand/5 bg-white p-8 text-center shadow-sm md:rounded-3xl md:px-10 md:py-[120px] dark:border-white/10 dark:bg-gray-900/40">
                        <h2 className="mb-8 text-3xl font-black text-gray-900 dark:text-white">
                            {dict.cta.title}
                        </h2>
                        <div className="flex flex-col justify-center gap-4 sm:flex-row">
                            <Link
                                href={`/${country}/buscar`}
                                className="dark:bg-muted dark:hover:bg-muted/80 rounded-2xl border border-gray-200 bg-gray-50 px-8 py-4 font-bold text-gray-900 transition-all hover:bg-gray-100 dark:border-white/10 dark:text-white"
                            >
                                {dict.cta.searchService}
                            </Link>
                            <Link
                                href={`/${country}/publicar`}
                                className="btn-primary flex items-center justify-center gap-2 rounded-2xl px-8 py-4"
                            >
                                {dict.cta.joinProvider} <ArrowRight size={20} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
