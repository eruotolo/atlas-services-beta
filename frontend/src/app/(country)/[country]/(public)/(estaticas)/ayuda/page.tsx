import type React from 'react';
import { ChevronDown } from 'lucide-react';
import type { Metadata } from 'next';

import { getPageDictionary } from '@/lib/i18n/getPageDictionary';

interface FaqBlock {
    type:
        | 'p'
        | 'p-bold'
        | 'p-bold-green'
        | 'p-bold-blue'
        | 'p-bold-red'
        | 'ol'
        | 'ul'
        | 'ul-grid'
        | 'note';
    text?: string;
    items?: string[];
}

interface FaqItem {
    q: string;
    a: FaqBlock[];
}

interface AyudaDict {
    meta: { title: string; description: string };
    header: { title: string; subtitle: string };
    cta: { title: string; subtitle: string; button: string };
    faqs: FaqItem[];
}

function renderParagraph(block: FaqBlock, i: number): React.ReactElement {
    switch (block.type) {
        case 'p-bold':
            return (
                <p key={i} className="font-bold">
                    {block.text}
                </p>
            );
        case 'p-bold-green':
            return (
                <p key={i} className="font-bold text-green-600 dark:text-green-400">
                    {block.text}
                </p>
            );
        case 'p-bold-blue':
            return (
                <p key={i} className="font-bold text-blue-600 dark:text-blue-400">
                    {block.text}
                </p>
            );
        case 'p-bold-red':
            return (
                <p key={i} className="font-bold text-red-600 dark:text-red-400">
                    {block.text}
                </p>
            );
        default:
            return <p key={i}>{block.text}</p>;
    }
}

function renderList(block: FaqBlock, i: number): React.ReactElement {
    if (block.type === 'ul-grid') {
        return (
            <ul key={i} className="grid grid-cols-2 gap-2">
                {block.items?.map((item, j) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: List items may be non-unique strings
                    <li key={j}>{item}</li>
                ))}
            </ul>
        );
    }
    if (block.type === 'ol') {
        return (
            <ol key={i} className="list-decimal space-y-2 pl-5">
                {block.items?.map((item, j) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: List items may be non-unique strings
                    <li key={j}>{item}</li>
                ))}
            </ol>
        );
    }
    return (
        <ul key={i} className="list-disc space-y-1 pl-5">
            {block.items?.map((item, j) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: List items may be non-unique strings
                <li key={j}>{item}</li>
            ))}
        </ul>
    );
}

function renderBlock(block: FaqBlock, i: number): React.ReactElement {
    if (block.type === 'note') {
        return (
            <p key={i} className="text-sm text-gray-600 dark:text-gray-400">
                {block.text}
            </p>
        );
    }
    if (block.type === 'ol' || block.type === 'ul' || block.type === 'ul-grid') {
        return renderList(block, i);
    }
    return renderParagraph(block, i);
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ country: string }>;
}): Promise<Metadata> {
    const { country } = await params;
    const dict = getPageDictionary<AyudaDict>('ayuda', country);
    return {
        title: dict.meta.title,
        description: dict.meta.description,
        alternates: { canonical: `/${country}/ayuda` },
    };
}

export default async function AyudaPage({
    params,
}: {
    params: Promise<{ country: string }>;
}): Promise<React.ReactElement> {
    const { country } = await params;
    const dict = getPageDictionary<AyudaDict>('ayuda', country);

    return (
        <section className="bg-background min-h-screen py-12 md:py-20">
            <div className="container mx-auto max-w-4xl px-4">
                <div className="mb-12 text-center">
                    <h1 className="mb-4 text-3xl leading-tight font-black text-gray-900 md:text-5xl dark:text-white">
                        {dict.header.title}
                    </h1>
                    <p className="mx-auto max-w-2xl text-base text-gray-600 md:text-lg dark:text-gray-400">
                        {dict.header.subtitle}
                    </p>
                </div>

                <div className="space-y-4">
                    {dict.faqs.map((faq) => (
                        <details
                            key={faq.q}
                            className="group rounded-2xl border border-gray-100 bg-white p-6 transition-all hover:shadow-md dark:border-white/10 dark:bg-gray-900/40"
                        >
                            <summary className="flex cursor-pointer items-center justify-between text-left text-base font-bold text-gray-900 md:text-lg dark:text-white">
                                <span>{faq.q}</span>
                                <ChevronDown
                                    size={20}
                                    className="shrink-0 transition-transform group-open:rotate-180"
                                />
                            </summary>
                            <div className="mt-4 space-y-3 text-sm text-gray-600 md:text-base dark:text-gray-400">
                                {faq.a.map((block, i) => renderBlock(block, i))}
                            </div>
                        </details>
                    ))}
                </div>

                <div className="mt-12 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-8 text-center dark:border-blue-900/30 dark:from-blue-900/20 dark:to-indigo-900/20">
                    <h3 className="mb-2 text-xl font-bold text-gray-900 md:text-2xl dark:text-white">
                        {dict.cta.title}
                    </h3>
                    <p className="mb-6 text-sm text-gray-600 md:text-base dark:text-gray-400">
                        {dict.cta.subtitle}
                    </p>
                    <a
                        href={`/${country}/contacto`}
                        className="inline-block rounded-2xl bg-blue-600 px-8 py-4 text-sm font-bold text-white transition-all hover:bg-blue-700 md:text-base"
                    >
                        {dict.cta.button}
                    </a>
                </div>
            </div>
        </section>
    );
}
