import type { ReactElement } from 'react';

import {
    Avatar,
    Btn,
    Card,
    Field,
    Input,
    Mono,
    Pill,
    SectionLabel,
    Stars,
    Stat,
    Toggle,
} from '@/shared/components/hireeo';

import { SectionShell } from './SectionShell';

function BlockTitle({ children }: { children: string }): ReactElement {
    return (
        <h3
            className="m-0 mb-4"
            style={{
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: '-0.01em',
                color: 'var(--ink)',
            }}
        >
            {children}
        </h3>
    );
}

function ButtonsBlock(): ReactElement {
    return (
        <Card padding={24}>
            <BlockTitle>Botones</BlockTitle>
            <div className="space-y-4">
                <div>
                    <SectionLabel className="mb-3">Variantes</SectionLabel>
                    <div className="flex flex-wrap gap-2">
                        <Btn variant="primary">Primary</Btn>
                        <Btn variant="secondary">Secondary</Btn>
                        <Btn variant="ghost">Ghost</Btn>
                        <Btn variant="accent">Accent</Btn>
                        <Btn variant="danger">Danger</Btn>
                        <Btn variant="dangerSolid">Danger solid</Btn>
                    </div>
                </div>
                <div>
                    <SectionLabel className="mb-3">Tamaños</SectionLabel>
                    <div className="flex flex-wrap items-center gap-2">
                        <Btn size="sm" variant="primary">
                            sm
                        </Btn>
                        <Btn size="md" variant="primary">
                            md
                        </Btn>
                        <Btn size="lg" variant="primary">
                            lg
                        </Btn>
                    </div>
                </div>
                <div>
                    <SectionLabel className="mb-3">Con icono</SectionLabel>
                    <div className="flex flex-wrap gap-2">
                        <Btn icon="search" variant="secondary">
                            Buscar
                        </Btn>
                        <Btn iconRight="arrowUR" variant="accent">
                            Contratar
                        </Btn>
                        <Btn icon="plus" variant="primary" size="sm">
                            Crear
                        </Btn>
                    </div>
                </div>
            </div>
        </Card>
    );
}

function PillsBlock(): ReactElement {
    return (
        <Card padding={24}>
            <BlockTitle>Pills</BlockTitle>
            <div className="flex flex-wrap gap-2">
                <Pill tone="default">default</Pill>
                <Pill tone="accent" icon="sparkle">
                    accent
                </Pill>
                <Pill tone="success" icon="check">
                    success
                </Pill>
                <Pill tone="warning" icon="alert">
                    warning
                </Pill>
                <Pill tone="danger">danger</Pill>
                <Pill tone="ink">ink</Pill>
                <Pill tone="outline">outline</Pill>
            </div>
        </Card>
    );
}

function FormsBlock(): ReactElement {
    return (
        <Card padding={24}>
            <BlockTitle>Formularios</BlockTitle>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Email" hint="Lo usaremos para enviarte cotizaciones">
                    <Input
                        icon="mail"
                        placeholder="tu@correo.com"
                        type="email"
                        defaultValue="marcelo@hireeo.app"
                    />
                </Field>
                <Field label="Localidad" optional>
                    <Input icon="pin" placeholder="Castro, Los Lagos" />
                </Field>
                <Field label="Presupuesto" hint="CLP">
                    <Input
                        icon="card"
                        placeholder="50.000"
                        suffix="CLP"
                        defaultValue="18.000"
                    />
                </Field>
                <Field label="Contraseña" error="Mínimo 8 caracteres">
                    <Input icon="key" type="password" defaultValue="abc" />
                </Field>
            </div>
        </Card>
    );
}

function StatsBlock(): ReactElement {
    return (
        <Card padding={24}>
            <BlockTitle>Stats</BlockTitle>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <Stat label="Servicios" value="1.482" trend="up" trendValue="+12%" />
                <Stat label="Cotizaciones" value="312" sub="últimos 30 días" />
                <Stat label="Conversión" value="4.6%" trend="down" trendValue="-0.4%" />
                <Stat label="Ingresos" value="$18M" big icon="card" />
            </div>
        </Card>
    );
}

function MiscBlock(): ReactElement {
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card padding={24}>
                <BlockTitle>Avatars · Toggle · Stars</BlockTitle>
                <div className="space-y-5">
                    <div className="flex items-center gap-3">
                        <Avatar name="Marcelo Águila" size={56} ring />
                        <Avatar name="Camila Rojas" size={44} />
                        <Avatar name="Pedro Soto" size={32} />
                        <Avatar name="Lía" size={24} />
                    </div>
                    <div className="flex items-center gap-4">
                        <Toggle defaultChecked size="md" ariaLabel="Verificado" />
                        <Toggle size="md" ariaLabel="Disponible" />
                        <Toggle defaultChecked size="sm" ariaLabel="Pro" />
                        <Toggle size="sm" disabled ariaLabel="Bloqueado" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Stars rating={4.8} showNum count={312} />
                        <Stars rating={3.5} showNum />
                        <Stars rating={2} />
                    </div>
                </div>
            </Card>

            <Card padding={24}>
                <BlockTitle>Patterns</BlockTitle>
                <div className="space-y-3">
                    <div
                        className="rounded-[10px] border p-4"
                        style={{
                            borderColor: 'var(--accent-soft)',
                            background: 'var(--accent-soft)',
                        }}
                    >
                        <div
                            className="text-[12.5px] font-semibold"
                            style={{ color: 'var(--accent)' }}
                        >
                            Callout · accent
                        </div>
                        <p
                            className="m-0 mt-1 text-[12.5px]"
                            style={{ color: 'var(--accent)', opacity: 0.85 }}
                        >
                            Información destacada con énfasis de marca.
                        </p>
                    </div>
                    <div
                        className="rounded-[10px] border p-4"
                        style={{
                            borderColor: 'var(--warning-soft)',
                            background: 'var(--warning-soft)',
                        }}
                    >
                        <div
                            className="text-[12.5px] font-semibold"
                            style={{ color: '#A37A1E' }}
                        >
                            Callout · warning
                        </div>
                        <p
                            className="m-0 mt-1 text-[12.5px]"
                            style={{ color: '#A37A1E', opacity: 0.9 }}
                        >
                            Algo requiere atención del usuario.
                        </p>
                    </div>
                    <div
                        className="rounded-[10px] border p-4"
                        style={{
                            borderColor: 'var(--danger-soft)',
                            background: 'var(--danger-soft)',
                        }}
                    >
                        <div
                            className="text-[12.5px] font-semibold"
                            style={{ color: 'var(--danger)' }}
                        >
                            Callout · danger
                        </div>
                        <p
                            className="m-0 mt-1 text-[12.5px]"
                            style={{ color: 'var(--danger)', opacity: 0.85 }}
                        >
                            Acción destructiva o error crítico.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}

export function ComponentesSection(): ReactElement {
    return (
        <SectionShell
            anchor="componentes"
            eyebrow="05 · Componentes"
            title="Primitivas listas para componer pantallas"
            description="12 primitivas tipadas en TypeScript estricto. Importar desde @/shared/components/hireeo."
        >
            <div className="space-y-4">
                <ButtonsBlock />
                <PillsBlock />
                <FormsBlock />
                <StatsBlock />
                <MiscBlock />
                <div
                    className="rounded-[10px] border p-4"
                    style={{ borderColor: 'var(--line)', background: 'var(--tint)' }}
                >
                    <SectionLabel>Import path</SectionLabel>
                    <Mono
                        className="mt-2 block text-[12.5px]"
                        style={{ color: 'var(--ink)' }}
                    >
                        import &#123; Btn, Pill, Avatar &#125; from
                        '@/shared/components/hireeo';
                    </Mono>
                </div>
            </div>
        </SectionShell>
    );
}
