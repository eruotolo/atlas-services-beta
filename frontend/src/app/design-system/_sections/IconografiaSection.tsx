import type { ReactElement } from 'react';

import { Card, HIRE_ICON_NAMES, Icon, Mono, SectionLabel } from '@/shared/components/hireeo';

import { SectionShell } from './SectionShell';

const SIZES = [11, 16, 20, 24, 32, 40] as const;

export function IconografiaSection(): ReactElement {
    return (
        <SectionShell
            anchor="iconografia"
            eyebrow="06 · Iconografía"
            title="63 iconos sobre lucide-react"
            description="Cada nombre del prototipo Hireeo está mapeado a un componente de lucide-react. Importar con name tipado por HireIconName."
        >
            <Card padding={24} className="mb-6">
                <SectionLabel className="mb-4">Grilla completa</SectionLabel>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                    {HIRE_ICON_NAMES.map((name) => (
                        <div
                            key={name}
                            className="flex flex-col items-center gap-2 rounded-[8px] border p-3 transition-colors hover:bg-tint"
                            style={{ borderColor: 'var(--line)' }}
                        >
                            <Icon name={name} size={20} />
                            <Mono
                                className="truncate text-[10.5px]"
                                style={{ color: 'var(--muted)' }}
                            >
                                {name}
                            </Mono>
                        </div>
                    ))}
                </div>
            </Card>

            <Card padding={24}>
                <SectionLabel className="mb-4">Tamaños</SectionLabel>
                <div className="flex items-end gap-8">
                    {SIZES.map((s) => (
                        <div key={s} className="flex flex-col items-center gap-2">
                            <Icon name="sparkle" size={s} />
                            <Mono className="text-[10.5px]" style={{ color: 'var(--muted)' }}>
                                {s}px
                            </Mono>
                        </div>
                    ))}
                </div>
            </Card>
        </SectionShell>
    );
}
