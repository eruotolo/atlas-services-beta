import type { ReactElement } from 'react';

import { Mono, SectionLabel } from '@/shared/components/hireeo';

import { SectionShell } from './SectionShell';

interface Swatch {
    name: string;
    cssVar: string;
    hex: string;
    fg?: 'light' | 'dark';
}

const NEUTROS: readonly Swatch[] = [
    { name: 'ink', cssVar: '--ink', hex: '#0A0A0A', fg: 'light' },
    { name: 'sub', cssVar: '--sub', hex: '#5B5B5B', fg: 'light' },
    { name: 'muted', cssVar: '--muted', hex: '#8E8E8E', fg: 'light' },
    { name: 'line', cssVar: '--line', hex: '#EBEBEB', fg: 'dark' },
    { name: 'hairline', cssVar: '--hairline', hex: '#F1F1F1', fg: 'dark' },
    { name: 'tint', cssVar: '--tint', hex: '#F7F8FA', fg: 'dark' },
    { name: 'tint-warm', cssVar: '--tint-warm', hex: '#FAFAF8', fg: 'dark' },
    { name: 'bg', cssVar: '--bg', hex: '#FFFFFF', fg: 'dark' },
];

const MARCA: readonly Swatch[] = [
    { name: 'accent', cssVar: '--accent', hex: '#2D4E8F', fg: 'light' },
    { name: 'accent-bright', cssVar: '--accent-bright', hex: '#5B8FD4', fg: 'light' },
    { name: 'accent-soft', cssVar: '--accent-soft', hex: '#E6EEFA', fg: 'dark' },
];

const ESTADOS: readonly Swatch[] = [
    { name: 'success', cssVar: '--success', hex: '#16A34A', fg: 'light' },
    { name: 'success-soft', cssVar: '--success-soft', hex: '#E6F8EE', fg: 'dark' },
    { name: 'warning', cssVar: '--warning', hex: '#E0A82E', fg: 'light' },
    { name: 'warning-soft', cssVar: '--warning-soft', hex: '#FDF4E1', fg: 'dark' },
    { name: 'danger', cssVar: '--danger', hex: '#D04545', fg: 'light' },
    { name: 'danger-soft', cssVar: '--danger-soft', hex: '#FCE9E9', fg: 'dark' },
    { name: 'amber', cssVar: '--amber', hex: '#F5B400', fg: 'dark' },
];

function SwatchTile({ swatch }: { swatch: Swatch }): ReactElement {
    const fg = swatch.fg === 'light' ? '#FFFFFF' : 'var(--ink)';
    return (
        <div
            className="overflow-hidden rounded-[10px] border"
            style={{ borderColor: 'var(--line)' }}
        >
            <div
                className="flex h-24 items-end p-3"
                style={{ background: swatch.hex }}
            >
                <Mono className="text-[10.5px] font-medium" style={{ color: fg, opacity: 0.85 }}>
                    {swatch.hex}
                </Mono>
            </div>
            <div className="px-3 py-2.5">
                <div
                    className="text-[12.5px] font-semibold"
                    style={{ color: 'var(--ink)', letterSpacing: '-0.005em' }}
                >
                    {swatch.name}
                </div>
                <Mono className="text-[10.5px]" style={{ color: 'var(--muted)' }}>
                    {swatch.cssVar}
                </Mono>
            </div>
        </div>
    );
}

function SwatchGroup({ title, items }: { title: string; items: readonly Swatch[] }): ReactElement {
    return (
        <div className="mb-10 last:mb-0">
            <SectionLabel className="mb-3">{title}</SectionLabel>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {items.map((s) => (
                    <SwatchTile key={s.name} swatch={s} />
                ))}
            </div>
        </div>
    );
}

export function ColorSection(): ReactElement {
    return (
        <SectionShell
            anchor="color"
            eyebrow="02 · Color"
            title="Paleta neutra con acento navy"
            description="Base blanco/negro con un único accent navy. Los soft variants se usan para fondos de pills, callouts y backgrounds destacados."
        >
            <SwatchGroup title="Neutros" items={NEUTROS} />
            <SwatchGroup title="Marca" items={MARCA} />
            <SwatchGroup title="Estados" items={ESTADOS} />
        </SectionShell>
    );
}
