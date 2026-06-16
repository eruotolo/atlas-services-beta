import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import Link from 'next/link';

import { getDictionary } from '@/lib/i18n/getDictionary';
import { Avatar, Icon, Mono, SectionLabel } from '@/shared/components/hireeo';
import { AnimatedRotatingText } from '@/shared/components/hireeo/ui/AnimatedRotatingText';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ country: string }>;
}): Promise<Metadata> {
    const { country } = await params;
    const dict = getDictionary(country).pages.quienesSomos;
    return {
        title: dict.meta.title,
        description: dict.meta.description,
        alternates: { canonical: `/${country}/about-us` },
    };
}

export default async function QuienesSomosPage({
    params,
}: {
    params: Promise<{ country: string }>;
}): Promise<ReactElement> {
    const { country } = await params;
    const dict = getDictionary(country).pages.quienesSomos;

    return (
        <div style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
            <section className="mx-auto w-full max-w-site px-6 pt-24 pb-12 sm:px-10 lg:px-14">
                <SectionLabel>{dict.hero.eyebrow}</SectionLabel>
                <h1
                    className="m-0 mt-3.5 mb-5 max-w-[950px]"
                    style={{
                        fontSize: 'clamp(36px, 6vw, 64px)',
                        fontWeight: 500,
                        letterSpacing: '-0.04em',
                        lineHeight: 0.98,
                        color: 'var(--ink)',
                    }}
                >
                    <AnimatedRotatingText
                        delay={300}
                        speed={40}
                        segments={[{ text: dict.hero.title }]}
                    />
                </h1>
                <p
                    className="m-0 max-w-[680px] text-[18px] leading-[1.55]"
                    style={{ color: 'var(--sub)' }}
                >
                    {dict.hero.subtitle}
                </p>
            </section>

            <section className="mx-auto w-full max-w-site px-6 pb-12 sm:px-10 lg:px-14">
                <div
                    className="grid grid-cols-2 md:grid-cols-4"
                    style={{
                        borderTop: '1px solid var(--line)',
                        borderBottom: '1px solid var(--line)',
                    }}
                >
                    {dict.numbers.map(([n, label]: string[], i) => (
                        <div
                            key={label}
                            className="p-6 md:p-8"
                            style={{
                                borderRight:
                                    i < dict.numbers.length - 1 ? '1px solid var(--line)' : 'none',
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 'clamp(32px, 4vw, 44px)',
                                    fontWeight: 500,
                                    letterSpacing: '-0.04em',
                                    lineHeight: 1,
                                    color: 'var(--ink)',
                                }}
                            >
                                {n}
                            </div>
                            <Mono
                                className="mt-2.5 inline-block text-[11px] font-semibold"
                                style={{
                                    color: 'var(--sub)',
                                    letterSpacing: '0.1em',
                                }}
                            >
                                {label.toUpperCase()}
                            </Mono>
                        </div>
                    ))}
                </div>
            </section>

            <section className="mx-auto w-full max-w-site px-6 py-12 sm:px-10 lg:px-14">
                <SectionLabel>{dict.principles.eyebrow}</SectionLabel>
                <h2
                    className="m-0 mt-3.5 mb-9"
                    style={{
                        fontSize: 'clamp(28px, 4vw, 38px)',
                        fontWeight: 500,
                        letterSpacing: '-0.03em',
                        color: 'var(--ink)',
                    }}
                >
                    <AnimatedRotatingText
                        delay={200}
                        speed={40}
                        segments={[{ text: dict.principles.title }]}
                    />
                </h2>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    {dict.principles.items.map((item) => (
                        <div
                            key={item.title}
                            className="rounded-xl border bg-bg p-6"
                            style={{ borderColor: 'var(--line)' }}
                        >
                            <Icon name="check" size={14} stroke="var(--accent)" strokeWidth={2.2} />
                            <h3
                                className="m-0 mt-4 mb-1.5"
                                style={{
                                    fontSize: 16,
                                    fontWeight: 600,
                                    letterSpacing: '-0.01em',
                                    color: 'var(--ink)',
                                }}
                            >
                                {item.title}
                            </h3>
                            <p
                                className="m-0 text-[13.5px] leading-[1.55]"
                                style={{ color: 'var(--sub)' }}
                            >
                                {item.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="mx-auto w-full max-w-site px-6 py-12 pb-20 sm:px-10 lg:px-14">
                <div className="mb-8 flex items-end justify-between gap-4">
                    <div>
                        <SectionLabel>{dict.team.eyebrow}</SectionLabel>
                        <h2
                            className="m-0 mt-3.5"
                            style={{
                                fontSize: 'clamp(28px, 4vw, 38px)',
                                fontWeight: 500,
                                letterSpacing: '-0.03em',
                                color: 'var(--ink)',
                            }}
                        >
                            <AnimatedRotatingText
                                delay={200}
                                speed={40}
                                segments={[{ text: dict.team.title }]}
                            />
                        </h2>
                    </div>
                    <span className="text-[13px]" style={{ color: 'var(--sub)' }}>
                        {dict.team.ctaText} →{' '}
                        <Mono className="font-semibold" style={{ color: 'var(--ink)' }}>
                            {dict.team.ctaLink}
                        </Mono>
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
                    {dict.team.members.map((member) => (
                        <div
                            key={member.name}
                            className="rounded-[10px] border bg-bg p-4"
                            style={{ borderColor: 'var(--line)', minHeight: 110 }}
                        >
                            <Avatar name={member.name} size={36} />
                            <div
                                className="mt-2.5 text-[13px] font-semibold"
                                style={{ color: 'var(--ink)' }}
                            >
                                {member.name}
                            </div>
                            <div
                                className="mt-0.5 text-[11.5px]"
                                style={{ color: 'var(--sub)' }}
                            >
                                {member.role}
                            </div>
                        </div>
                    ))}
                    <div
                        className="flex flex-col justify-between rounded-[10px] p-4"
                        style={{ background: 'var(--tint)', minHeight: 110 }}
                    >
                        <Mono
                            className="text-[11px]"
                            style={{ color: 'var(--sub)', letterSpacing: '0.05em' }}
                        >
                            {dict.team.moreLabel}
                        </Mono>
                        <div
                            className="text-[12.5px] leading-[1.4]"
                            style={{ color: 'var(--sub)' }}
                        >
                            {dict.team.moreDesc}
                        </div>
                    </div>
                    <Link
                        href={`/${country}/contact`}
                        className="flex items-center justify-center rounded-[10px] border p-4 text-center transition-colors hover:bg-tint"
                        style={{
                            borderColor: 'var(--line)',
                            borderStyle: 'dashed',
                            minHeight: 110,
                        }}
                    >
                        <Mono
                            className="text-[11px]"
                            style={{ color: 'var(--sub)', letterSpacing: '0.08em' }}
                        >
                            {dict.team.joinLabel}
                        </Mono>
                    </Link>
                </div>
            </section>
        </div>
    );
}
