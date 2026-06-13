import type { ReactElement } from 'react';

import { Card, Mono, Pill, SectionLabel, Stat } from '@/shared/components/hireeo';

export function HeroSection(): ReactElement {
    return (
        <section className="border-b" style={{ borderColor: 'var(--line)' }}>
            <div className="mx-auto max-w-site px-14 pt-24 pb-20">
                <Pill icon="sparkle" tone="default" style={{ marginBottom: 32 }}>
                    Hireeo Design System · v2.0
                </Pill>
                <h1
                    className="m-0 mb-6 max-w-[920px]"
                    style={{
                        fontSize: 72,
                        fontWeight: 500,
                        lineHeight: 0.98,
                        letterSpacing: '-0.04em',
                        color: 'var(--ink)',
                    }}
                >
                    El sistema visual que sostiene a{' '}
                    <span style={{ color: 'var(--accent)' }}>Hireeo</span>.
                </h1>
                <p
                    className="m-0 mb-12 max-w-[640px] text-[18px] leading-[1.5]"
                    style={{ color: 'var(--sub)' }}
                >
                    Tokens, tipografía, iconografía y componentes. La fuente única de verdad
                    para construir cualquier pantalla de la plataforma.
                </p>

                <div className="mb-12 grid grid-cols-2 gap-3 md:grid-cols-4">
                    <Stat label="Colores" value="18" sub="neutros + marca + estados" />
                    <Stat label="Tipografía" value="8" sub="niveles de escala" />
                    <Stat label="Iconos" value="63" sub="SVG propios" />
                    <Stat label="Componentes" value="12" sub="primitivas listas" />
                </div>

                <Card padding={20}>
                    <SectionLabel>Stack técnico</SectionLabel>
                    <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
                        {[
                            ['Framework', 'Next.js 16.1'],
                            ['UI runtime', 'React 19'],
                            ['Styling', 'Tailwind CSS v4'],
                            ['Tipografía', 'Geist · Mono · Serif'],
                        ].map(([k, v]) => (
                            <div key={k}>
                                <div className="text-[10.5px]" style={{ color: 'var(--muted)' }}>
                                    {k}
                                </div>
                                <Mono
                                    className="text-[13px]"
                                    style={{ color: 'var(--ink)', fontWeight: 500 }}
                                >
                                    {v}
                                </Mono>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </section>
    );
}
