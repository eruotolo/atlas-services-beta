import type React from 'react';

import { getPageDictionary } from '@/lib/i18n/getPageDictionary';

interface PrivacidadSection {
    title: string;
    content?: string;
    items?: string[];
}

interface PrivacidadDict {
    title: string;
    lastUpdated: string;
    sections: PrivacidadSection[];
    footer: string;
}

function isContactSection(title: string): boolean {
    return title === 'Contacto' || title === 'Contact';
}

export default async function PrivacidadPage({
    params,
}: {
    params: Promise<{ country: string }>;
}): Promise<React.ReactElement> {
    const { country } = await params;
    const dict = getPageDictionary<PrivacidadDict>('privacidad', country);

    return (
        <section className="bg-background py-[100px]">
            <div className="container mx-auto max-w-4xl px-4">
                <h1 className="mb-8 text-4xl font-black text-gray-900 dark:text-white">{dict.title}</h1>
                <div className="prose prose-blue max-w-none text-gray-900 dark:text-gray-300">
                    <p className="text-gray-500 italic dark:text-gray-400">{dict.lastUpdated}</p>
                    <div className="mt-8 space-y-12">
                        {dict.sections.map((section) => (
                            <section key={section.title}>
                                <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                                    {section.title}
                                </h2>
                                {section.items ? (
                                    <ul className="list-disc space-y-2 pl-5">
                                        {section.items.map((item) => (
                                            <li key={item}>{item}</li>
                                        ))}
                                    </ul>
                                ) : isContactSection(section.title) ? (
                                    <p>
                                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                                            {section.content}
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
