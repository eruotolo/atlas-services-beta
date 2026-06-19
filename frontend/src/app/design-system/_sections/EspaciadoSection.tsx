import type { ReactElement } from 'react';

import { Card, Mono, SectionLabel } from '@/shared/components/hireeo';

import { SectionShell } from './SectionShell';

const SPACES: readonly number[] = [2, 4, 6, 8, 10, 12, 16, 20, 24, 28, 36];
const RADII: readonly { name: string; value: number | string }[] = [
    { name: 'xs', value: 6 },
    { name: 'sm', value: 8 },
    { name: 'md', value: 10 },
    { name: 'lg', value: 12 },
    { name: 'xl', value: 16 },
    { name: 'full', value: '999px' },
];

const SHADOWS: readonly { name: string; preview: string; css: string }[] = [
    {
        name: 'sm',
        preview: '0 1px 2px rgba(10,10,10,0.05)',
        css: '0 1px 2px rgba(10,10,10,0.05)',
    },
    {
        name: 'md',
        preview: '0 8px 24px rgba(10,10,10,0.06)',
        css: '0 8px 24px rgba(10,10,10,0.06)',
    },
    {
        name: 'lg',
        preview: '0 30px 80px rgba(10,10,10,0.07), 0 8px 30px rgba(10,10,10,0.04)',
        css: '0 30px 80px rgba(10,10,10,0.07), 0 8px 30px rgba(10,10,10,0.04)',
    },
];

export function EspaciadoSection(): ReactElement {
    return (
        <SectionShell
            anchor="espaciado"
            eyebrow="04 · Espaciado · Radios · Sombras"
            title="La grilla, el bloque y la luz"
            description="Espaciado en pasos de 2px, radios en 6 niveles, sombras suaves con tonos neutros para crear profundidad sin saturar."
        >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card padding={24}>
                    <SectionLabel className="mb-4">Espaciado</SectionLabel>
                    <div className="flex flex-col gap-2">
                        {SPACES.map((px) => (
                            <div key={px} className="flex items-center gap-3">
                                <Mono
                                    className="w-10 text-[11px]"
                                    style={{ color: 'var(--muted)' }}
                                >
                                    {px}
                                </Mono>
                                <div
                                    className="h-1.5 rounded-full"
                                    style={{
                                        width: px * 6,
                                        background: 'var(--accent)',
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </Card>

                <Card padding={24}>
                    <SectionLabel className="mb-4">Radios</SectionLabel>
                    <div className="grid grid-cols-3 gap-3">
                        {RADII.map((r) => (
                            <div key={r.name} className="flex flex-col items-center gap-2">
                                <div
                                    className="h-14 w-14 border"
                                    style={{
                                        borderRadius: r.value,
                                        background: 'var(--tint)',
                                        borderColor: 'var(--line)',
                                    }}
                                />
                                <Mono className="text-[10.5px]" style={{ color: 'var(--muted)' }}>
                                    {r.name}
                                </Mono>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card padding={24}>
                    <SectionLabel className="mb-4">Sombras</SectionLabel>
                    <div className="flex flex-col gap-4">
                        {SHADOWS.map((s) => (
                            <div key={s.name} className="flex items-center gap-4">
                                <div
                                    className="h-16 w-16 rounded-[10px]"
                                    style={{ background: 'var(--bg)', boxShadow: s.preview }}
                                />
                                <div>
                                    <Mono
                                        className="text-[12.5px] font-semibold"
                                        style={{ color: 'var(--ink)' }}
                                    >
                                        shadow-{s.name}
                                    </Mono>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </SectionShell>
    );
}
