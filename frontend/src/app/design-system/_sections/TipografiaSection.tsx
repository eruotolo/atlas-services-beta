import type { ReactElement } from 'react';

import { Card, Mono, SectionLabel } from '@/shared/components/hireeo';

import { SectionShell } from './SectionShell';

interface Scale {
    label: string;
    sample: string;
    size: number;
    weight: number;
    lh: number;
    tracking: string;
}

const SCALES: readonly Scale[] = [
    { label: 'display', sample: 'La infraestructura del oficio', size: 64, weight: 500, lh: 0.96, tracking: '-0.04em' },
    { label: 'h1', sample: 'Encontrá al profesional ideal', size: 42, weight: 500, lh: 1.02, tracking: '-0.025em' },
    { label: 'h2', sample: 'Servicios verificados', size: 28, weight: 500, lh: 1.1, tracking: '-0.025em' },
    { label: 'h3', sample: 'Reseñas reales', size: 20, weight: 600, lh: 1.2, tracking: '-0.015em' },
    { label: 'body', sample: 'Texto principal usado en párrafos y contenidos largos.', size: 16, weight: 500, lh: 1.5, tracking: '-0.005em' },
    { label: 'body-sm', sample: 'Texto secundario, capciones y notas auxiliares.', size: 14, weight: 400, lh: 1.5, tracking: '-0.005em' },
    { label: 'caption', sample: 'Metadata · 12px · uso editorial.', size: 12, weight: 500, lh: 1.45, tracking: '0' },
    { label: 'label', sample: 'LABELS UPPERCASE', size: 11, weight: 600, lh: 1.4, tracking: '0.15em' },
];

function ScaleRow({ s }: { s: Scale }): ReactElement {
    return (
        <div
            className="flex items-baseline gap-6 border-b py-5 last:border-b-0"
            style={{ borderColor: 'var(--hairline)' }}
        >
            <div className="w-[120px] shrink-0">
                <Mono className="text-[10.5px]" style={{ color: 'var(--muted)' }}>
                    {s.label}
                </Mono>
                <Mono className="block text-[10.5px]" style={{ color: 'var(--muted)' }}>
                    {s.size}px · {s.weight}
                </Mono>
            </div>
            <div
                className="flex-1"
                style={{
                    fontSize: s.size,
                    fontWeight: s.weight,
                    lineHeight: s.lh,
                    letterSpacing: s.tracking,
                    color: 'var(--ink)',
                    textTransform: s.label === 'label' ? 'uppercase' : 'none',
                }}
            >
                {s.sample}
            </div>
        </div>
    );
}

export function TipografiaSection(): ReactElement {
    return (
        <SectionShell
            anchor="tipografia"
            eyebrow="03 · Tipografía"
            title="Geist sans + Geist Mono"
            description="Geist es la familia principal; Geist Mono se usa para datos tabulares, códigos y metadata; Instrument Serif queda reservado para acentos editoriales."
        >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card padding={24}>
                    <SectionLabel>Sans</SectionLabel>
                    <div
                        className="mt-3"
                        style={{ fontFamily: 'var(--font-sans)', fontSize: 44, fontWeight: 500, letterSpacing: '-0.03em' }}
                    >
                        Geist
                    </div>
                    <Mono className="mt-2 block text-[11px]" style={{ color: 'var(--muted)' }}>
                        --font-sans
                    </Mono>
                </Card>
                <Card padding={24}>
                    <SectionLabel>Mono</SectionLabel>
                    <div
                        className="mt-3"
                        style={{ fontFamily: 'var(--font-mono)', fontSize: 44, fontWeight: 500 }}
                    >
                        Geist Mono
                    </div>
                    <Mono className="mt-2 block text-[11px]" style={{ color: 'var(--muted)' }}>
                        --font-mono
                    </Mono>
                </Card>
                <Card padding={24}>
                    <SectionLabel>Serif</SectionLabel>
                    <div
                        className="mt-3"
                        style={{ fontFamily: 'var(--font-serif)', fontSize: 48, fontStyle: 'italic' }}
                    >
                        Instrument
                    </div>
                    <Mono className="mt-2 block text-[11px]" style={{ color: 'var(--muted)' }}>
                        --font-serif
                    </Mono>
                </Card>
            </div>

            <Card padding={24} className="mt-8">
                <SectionLabel>Escala tipográfica</SectionLabel>
                <div className="mt-4">
                    {SCALES.map((s) => (
                        <ScaleRow key={s.label} s={s} />
                    ))}
                </div>
            </Card>
        </SectionShell>
    );
}
