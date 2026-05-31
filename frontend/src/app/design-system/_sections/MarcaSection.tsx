import Image from 'next/image';
import type { ReactElement } from 'react';

import { Card, Mono, SectionLabel } from '@/shared/components/hireeo';

import { SectionShell } from './SectionShell';

const DONTS = [
    { label: 'No deformar', hint: 'mantener proporciones originales' },
    { label: 'No rotar', hint: 'usar siempre en horizontal' },
    { label: 'No recolorizar', hint: 'usar las versiones oficiales' },
];

export function MarcaSection(): ReactElement {
    return (
        <SectionShell
            anchor="marca"
            eyebrow="01 · Marca"
            title="Logo, isotipo y reglas de uso"
            description="El logo de Hireeo funciona sobre fondo claro y oscuro, con un área de seguridad mínima de 16px en cada lado."
        >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Card padding={32} hover>
                    <SectionLabel>Logo principal</SectionLabel>
                    <div className="mt-6 flex h-[140px] items-center justify-center">
                        <Image
                            src="/logo.svg"
                            alt="Hireeo logo"
                            width={200}
                            height={56}
                            priority
                        />
                    </div>
                    <Mono
                        className="mt-6 block text-[11px]"
                        style={{ color: 'var(--muted)' }}
                    >
                        /logo.svg
                    </Mono>
                </Card>
                <Card
                    padding={32}
                    style={{
                        background: 'var(--ink)',
                        borderColor: 'var(--ink)',
                    }}
                >
                    <SectionLabel color="rgba(255,255,255,0.6)">Logo invertido</SectionLabel>
                    <div className="mt-6 flex h-[140px] items-center justify-center">
                        <Image
                            src="/logo.png"
                            alt="Hireeo logo invertido"
                            width={200}
                            height={56}
                            style={{ filter: 'invert(1) brightness(2)' }}
                        />
                    </div>
                    <Mono
                        className="mt-6 block text-[11px]"
                        style={{ color: 'rgba(255,255,255,0.5)' }}
                    >
                        /logo.png · sobre fondo oscuro
                    </Mono>
                </Card>
            </div>

            <div className="mt-8">
                <SectionLabel className="mb-4">Reglas críticas</SectionLabel>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    {DONTS.map((d) => (
                        <Card key={d.label} padding={20}>
                            <div
                                className="mb-2 inline-flex items-center gap-2 text-[12px] font-semibold"
                                style={{ color: 'var(--danger)' }}
                            >
                                {d.label}
                            </div>
                            <p
                                className="m-0 text-[12.5px] leading-[1.5]"
                                style={{ color: 'var(--sub)' }}
                            >
                                {d.hint}
                            </p>
                        </Card>
                    ))}
                </div>
            </div>
        </SectionShell>
    );
}
