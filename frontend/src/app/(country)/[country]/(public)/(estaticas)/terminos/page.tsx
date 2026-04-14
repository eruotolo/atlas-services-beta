import type React from 'react';

import { getPageDictionary } from '@/lib/i18n/getPageDictionary';

interface TerminosSection {
    title: string;
    content?: string;
    intro?: string;
    items?: string[];
}

interface TerminosDict {
    title: string;
    lastUpdated: string;
    sections: TerminosSection[];
    footer: string;
}

function isContactSection(title: string): boolean {
    return title.includes('7.') || title === '7. Applicable law and contact';
}

function splitContactContent(content: string): { label: string; value: string } {
    const colonIndex = content.indexOf(':');
    if (colonIndex === -1) return { label: content, value: '' };
    return {
        label: content.slice(0, colonIndex + 1),
        value: content.slice(colonIndex + 1).trim(),
    };
}

export default async function TerminosPage({
    params,
}: {
    params: Promise<{ country: string }>;
}): Promise<React.ReactElement> {
    const { country } = await params;
    const dict = getPageDictionary<TerminosDict>('terminos', country);

    return (
        <section className="bg-background py-[100px]">
            <div className="container mx-auto max-w-4xl px-4">
                <h1 className="mb-8 text-4xl font-black text-gray-900 dark:text-white">{dict.title}</h1>
                <div className="prose prose-blue max-w-none text-gray-900 dark:text-gray-300">
                    <p className="text-gray-500 italic dark:text-gray-400">{dict.lastUpdated}</p>
                    <div className="space-y-12">
                        {dict.sections.map((section) => (
                            <section key={section.title}>
                                <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                                    {section.title}
                                </h2>
                                {section.intro && <p className="mb-3">{section.intro}</p>}
                                {section.items ? (
                                    <ul className="list-disc space-y-3 pl-5">
                                        {section.items.map((item) => (
                                            <li key={item}>{item}</li>
                                        ))}
                                    </ul>
                                ) : isContactSection(section.title) && section.content ? (
                                    <p>
                                        {splitContactContent(section.content).label}{' '}
                                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                                            {splitContactContent(section.content).value}
                                        </span>
                                    </p>
                                ) : (
                                    <p>{section.content}</p>
                                )}
                            </section>
                        ))}
                    </div>
                    <section className="dark:bg-muted mt-12 rounded-3xl border border-gray-100 bg-gray-50 p-8 dark:border-white/10">
                        <p className="text-center text-base font-medium text-gray-700 dark:text-gray-300">
                            {dict.footer}
                        </p>
                    </section>
                </div>
            </div>
        </section>
    );
}
