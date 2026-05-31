import type { ReactElement } from 'react';

import { Card, Mono, SectionLabel } from '@/shared/components/hireeo';

import { SectionShell } from './SectionShell';

const SNIPPET_BTN = `import { Btn } from '@/shared/components/hireeo';

export function HeroCTA() {
    return (
        <Btn size="lg" variant="accent" iconRight="arrowUR">
            Buscar un profesional
        </Btn>
    );
}`;

const SNIPPET_STAT = `import { Stat } from '@/shared/components/hireeo';

<Stat
    label="Cotizaciones"
    value="312"
    sub="últimos 30 días"
    trend="up"
    trendValue="+12%"
/>`;

const TOKENS_TABLE: readonly { token: string; usage: string }[] = [
    { token: '--ink', usage: 'Texto principal · botones primary' },
    { token: '--sub', usage: 'Texto secundario · descripciones' },
    { token: '--muted', usage: 'Labels eyebrow · metadata' },
    { token: '--line', usage: 'Bordes · separadores · hairlines' },
    { token: '--bg', usage: 'Fondo principal · cards' },
    { token: '--tint', usage: 'Fondo de campos · hover sutil' },
    { token: '--accent', usage: 'CTA secundario · enlaces · marca' },
    { token: '--accent-soft', usage: 'Fondos de pills accent · callouts' },
    { token: '--success / --danger / --warning', usage: 'Estados semánticos' },
];

function CodeBlock({ code }: { code: string }): ReactElement {
    return (
        <pre
            className="overflow-x-auto rounded-[10px] border p-4 text-[12.5px] leading-[1.6]"
            style={{
                borderColor: 'var(--line)',
                background: 'var(--tint)',
                color: 'var(--ink)',
                fontFamily: 'var(--font-mono)',
                fontFeatureSettings: '"tnum"',
            }}
        >
            <code>{code}</code>
        </pre>
    );
}

export function UsoSection(): ReactElement {
    return (
        <SectionShell
            anchor="uso"
            eyebrow="07 · Uso"
            title="Snippets y referencia rápida de tokens"
        >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Card padding={20}>
                    <SectionLabel className="mb-3">Botón CTA</SectionLabel>
                    <CodeBlock code={SNIPPET_BTN} />
                </Card>
                <Card padding={20}>
                    <SectionLabel className="mb-3">Stat con trend</SectionLabel>
                    <CodeBlock code={SNIPPET_STAT} />
                </Card>
            </div>

            <Card padding={20} className="mt-6">
                <SectionLabel className="mb-4">Tokens — referencia</SectionLabel>
                <div className="overflow-hidden rounded-[8px] border" style={{ borderColor: 'var(--hairline)' }}>
                    <table className="w-full text-left text-[12.5px]">
                        <thead style={{ background: 'var(--tint)' }}>
                            <tr>
                                <th
                                    className="px-4 py-2.5 text-[10.5px] font-semibold uppercase"
                                    style={{ color: 'var(--muted)', letterSpacing: '0.1em' }}
                                >
                                    Token
                                </th>
                                <th
                                    className="px-4 py-2.5 text-[10.5px] font-semibold uppercase"
                                    style={{ color: 'var(--muted)', letterSpacing: '0.1em' }}
                                >
                                    Uso recomendado
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {TOKENS_TABLE.map((row) => (
                                <tr
                                    key={row.token}
                                    className="border-t"
                                    style={{ borderColor: 'var(--hairline)' }}
                                >
                                    <td className="px-4 py-2.5" style={{ color: 'var(--ink)' }}>
                                        <Mono className="text-[12px] font-semibold">{row.token}</Mono>
                                    </td>
                                    <td className="px-4 py-2.5" style={{ color: 'var(--sub)' }}>
                                        {row.usage}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </SectionShell>
    );
}
