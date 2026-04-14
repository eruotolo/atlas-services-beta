import type React from 'react';
import { Award, CheckCircle, MessageSquare, PlusCircle, Search, Star } from 'lucide-react';
import type { Metadata } from 'next';

import { getPageDictionary } from '@/lib/i18n/getPageDictionary';

interface ComoFuncionaDict {
    meta: { title: string; description: string };
    hero: { title: string; subtitle: string };
    forClients: { label: string; title: string; steps: Array<{ title: string; desc: string }> };
    forProviders: { label: string; title: string; steps: Array<{ title: string; desc: string }> };
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ country: string }>;
}): Promise<Metadata> {
    const { country } = await params;
    const dict = getPageDictionary<ComoFuncionaDict>('como-funciona', country);
    return {
        title: dict.meta.title,
        description: dict.meta.description,
        alternates: { canonical: `/${country}/como-funciona` },
    };
}

const CLIENT_ICONS = [Search, MessageSquare, Star];
const PROVIDER_ICONS = [PlusCircle, Award, CheckCircle];

export default async function ComoFuncionaPage({
    params,
}: {
    params: Promise<{ country: string }>;
}): Promise<React.ReactElement> {
    const { country } = await params;
    const dict = getPageDictionary<ComoFuncionaDict>('como-funciona', country);

    return (
        <div className="bg-background">
            <section className="bg-blue-600 px-4 py-12 text-center md:py-20 dark:bg-blue-700">
                <div className="container mx-auto max-w-7xl px-4">
                    <h1 className="mb-4 text-3xl leading-tight font-black text-white md:mb-6 md:text-5xl">
                        {dict.hero.title}
                    </h1>
                    <p className="mx-auto max-w-2xl text-base text-blue-100 opacity-90 md:text-lg">
                        {dict.hero.subtitle}
                    </p>
                </div>
            </section>

            <section className="bg-background w-full py-12 md:py-20">
                <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-10 text-center md:mb-16">
                        <span className="text-[10px] font-black tracking-widest text-blue-600 uppercase md:text-sm dark:text-blue-400">
                            {dict.forClients.label}
                        </span>
                        <h2 className="mt-2 text-2xl font-black text-gray-900 md:text-3xl dark:text-white">
                            {dict.forClients.title}
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 gap-10 text-center md:grid-cols-3 md:gap-12">
                        {dict.forClients.steps.map((step, i) => {
                            const Icon = CLIENT_ICONS[i];
                            return (
                                <div key={step.title} className="space-y-3 md:space-y-4">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 md:h-16 md:w-16 dark:bg-blue-900/20 dark:text-blue-400">
                                        <Icon size={28} className="md:h-8 md:w-8" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 md:text-xl dark:text-white">
                                        {step.title}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-gray-500 md:text-base dark:text-gray-400">
                                        {step.desc}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="dark:bg-background w-full border-t border-gray-100 bg-gray-50 py-12 md:py-20 dark:border-gray-800">
                <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-10 text-center md:mb-16">
                        <span className="text-[10px] font-black tracking-widest text-green-600 uppercase md:text-sm dark:text-green-400">
                            {dict.forProviders.label}
                        </span>
                        <h2 className="mt-2 text-2xl font-black text-gray-900 md:text-3xl dark:text-white">
                            {dict.forProviders.title}
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 gap-10 text-center md:grid-cols-3 md:gap-12">
                        {dict.forProviders.steps.map((step, i) => {
                            const Icon = PROVIDER_ICONS[i];
                            return (
                                <div key={step.title} className="space-y-3 md:space-y-4">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-600 md:h-16 md:w-16 dark:bg-green-900/20 dark:text-green-400">
                                        <Icon size={28} className="md:h-8 md:w-8" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 md:text-xl dark:text-white">
                                        {step.title}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-gray-500 md:text-base dark:text-gray-400">
                                        {step.desc}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>
        </div>
    );
}
