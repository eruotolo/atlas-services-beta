import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import { getDictionary } from '@/lib/i18n/getDictionary';
import { Avatar, Icon, Mono, Pill, SectionLabel } from '@/shared/components/hireeo';
import { AnimatedRotatingText } from '@/shared/components/hireeo/ui/AnimatedRotatingText';

type StepShot = 'chat' | 'list' | 'pay';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ country: string }>;
}): Promise<Metadata> {
    const { country } = await params;
    const dict = getDictionary(country).pages.comoFunciona;
    return {
        title: dict.meta.title,
        description: dict.meta.description,
        alternates: { canonical: `/${country}/how-it-works` },
    };
}

function ChatMock(): ReactElement {
    return (
        <div className="flex flex-col gap-2">
            <div
                className="self-end max-w-[75%] rounded-[12px_12px_4px_12px] px-3 py-2 text-[12px]"
                style={{ background: 'var(--ink)', color: 'var(--bg)' }}
            >
                Se trabó el portón eléctrico, necesito sacar el auto antes de las 8
            </div>
            <div
                className="self-start max-w-[85%] rounded-[12px_12px_12px_4px] border bg-bg px-3 py-2 text-[12px]"
                style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
            >
                Entendido — es{' '}
                <Pill tone="accent" style={{ fontSize: 9 }}>
                    cerrajería · urgente
                </Pill>{' '}
                en{' '}
                <Pill tone="accent" style={{ fontSize: 9 }}>
                    Las Condes
                </Pill>
                . Te conecto con 2 pros disponibles ahora.
            </div>
        </div>
    );
}

function ListMock(): ReactElement {
    const rows: [string, string, string][] = [
        ['Carlos M.', '15 min', '4.9'],
        ['Luis F.', '22 min', '4.8'],
        ['Daniel R.', '40 min', '4.9'],
    ];
    return (
        <div className="flex flex-col gap-1.5">
            {rows.map(([name, eta, rating]) => (
                <div
                    key={name}
                    className="flex items-center gap-2 rounded-[7px] border bg-bg p-2 text-[12px]"
                    style={{ borderColor: 'var(--line)' }}
                >
                    <Avatar name={name} size={24} />
                    <span className="flex-1 font-medium" style={{ color: 'var(--ink)' }}>
                        {name}
                    </span>
                    <Mono style={{ color: 'var(--sub)' }}>{eta}</Mono>
                    <Icon name="star" size={10} stroke="var(--amber)" fill="var(--amber)" />
                    <span style={{ color: 'var(--ink)' }}>{rating}</span>
                </div>
            ))}
        </div>
    );
}

function PayMock(): ReactElement {
    return (
        <div className="flex flex-col gap-1.5">
            <div
                className="flex items-center justify-between rounded-[7px] border bg-bg p-2.5 text-[12px]"
                style={{ borderColor: 'var(--line)' }}
            >
                <span style={{ color: 'var(--sub)' }}>Cerrajería · 25 min</span>
                <Mono className="font-semibold" style={{ color: 'var(--ink)' }}>
                    $32.000 CLP
                </Mono>
            </div>
            <div
                className="flex items-center gap-2 rounded-[7px] border bg-bg p-2.5 text-[12px]"
                style={{ borderColor: 'var(--line)' }}
            >
                <Icon name="card" size={12} stroke="var(--sub)" />
                <span style={{ color: 'var(--ink)' }}>MercadoPago</span>
                <span className="ml-auto">
                    <Pill tone="success" style={{ fontSize: 9 }}>
                        autorizado
                    </Pill>
                </span>
            </div>
        </div>
    );
}

function StepShotPanel({ shot }: { shot: StepShot }): ReactElement {
    return (
        <div
            className="rounded-xl border p-4 text-[12px]"
            style={{ background: 'var(--tint)', borderColor: 'var(--line)' }}
        >
            {shot === 'chat' ? <ChatMock /> : null}
            {shot === 'list' ? <ListMock /> : null}
            {shot === 'pay' ? <PayMock /> : null}
        </div>
    );
}

export default async function ComoFuncionaPage({
    params,
}: {
    params: Promise<{ country: string }>;
}): Promise<ReactElement> {
    const { country } = await params;
    const dict = getDictionary(country).pages.comoFunciona;

    return (
        <div style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
            <section className="mx-auto w-full max-w-site px-6 pt-24 pb-12 sm:px-10 lg:px-14">
                <SectionLabel>{dict.hero.eyebrow}</SectionLabel>
                <h1
                    className="m-0 mt-3.5 mb-5 max-w-[900px]"
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
                        segments={[{ text: `${dict.hero.titleBefore}\n${dict.hero.titleAfter}` }]}
                    />
                </h1>
                <p
                    className="m-0 max-w-[660px] text-[18px] leading-[1.55]"
                    style={{ color: 'var(--sub)' }}
                >
                    {dict.hero.subtitle}
                </p>
            </section>

            <section className="mx-auto w-full max-w-site px-6 pb-20 sm:px-10 lg:px-14">
                {dict.steps.map((s, i) => (
                    <div
                        key={s.n}
                        className="grid items-start gap-8 py-9 md:grid-cols-[70px_minmax(0,1fr)_minmax(0,1.1fr)]"
                        style={{
                            borderTop: i === 0 ? '1px solid var(--line)' : 'none',
                            borderBottom: '1px solid var(--line)',
                        }}
                    >
                        <Mono
                            style={{
                                fontSize: 42,
                                fontWeight: 500,
                                color: 'var(--ink)',
                                letterSpacing: '-0.02em',
                                lineHeight: 1,
                            }}
                        >
                            {s.n}
                        </Mono>
                        <div>
                            <h3
                                className="m-0 mb-3"
                                style={{
                                    fontSize: 28,
                                    fontWeight: 500,
                                    letterSpacing: '-0.025em',
                                    color: 'var(--ink)',
                                }}
                            >
                                {s.title}
                            </h3>
                            <p
                                className="m-0 mb-3.5 text-[15.5px] leading-[1.55]"
                                style={{ color: 'var(--sub)' }}
                            >
                                {s.desc}
                            </p>
                            <Pill icon="info">{s.meta}</Pill>
                        </div>
                        <StepShotPanel shot={s.shot as StepShot} />
                    </div>
                ))}
            </section>

            <section className="mx-auto w-full max-w-site px-6 pt-12 pb-20 sm:px-10 lg:px-14">
                <SectionLabel>{dict.faq.eyebrow}</SectionLabel>
                <h2
                    className="m-0 mt-3.5 mb-8"
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
                        segments={[{ text: dict.faq.title }]}
                    />
                </h2>
                <div style={{ borderTop: '1px solid var(--line)' }}>
                    {dict.faq.items.map(([q, a]: string[], i) => (
                        <div
                            key={q}
                            className="grid items-start gap-6 py-5"
                            style={{
                                gridTemplateColumns: '40px minmax(0, 1fr) 40px',
                                borderBottom: '1px solid var(--line)',
                            }}
                        >
                            <Mono
                                className="text-[13px] font-semibold"
                                style={{ color: 'var(--sub)' }}
                            >
                                {String(i + 1).padStart(2, '0')}
                            </Mono>
                            <div>
                                <div
                                    className="mb-2 text-[17px] font-semibold"
                                    style={{ color: 'var(--ink)' }}
                                >
                                    {q}
                                </div>
                                <div
                                    className="text-[14.5px] leading-[1.55]"
                                    style={{ color: 'var(--sub)' }}
                                >
                                    {a}
                                </div>
                            </div>
                            <Icon name="chevronDown" size={16} stroke="var(--muted)" />
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
