import Link from 'next/link';
import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import { COUNTRY_SEO_CONFIG, formatPrice } from '@/features/geo/lib/countryUtils';
import { obtenerPreciosPremiumActivos } from '@/features/payments/actions';
import { Btn, Icon, Mono, SectionLabel } from '@/shared/components/hireeo';

export const revalidate = 0;

type Props = { params: Promise<{ country: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { country } = await params;
    const countryName = COUNTRY_SEO_CONFIG[country]?.countryName ?? country.toUpperCase();
    return {
        title: 'Hireeo Pro · Para los que viven del oficio',
        description: `Destacá tu servicio en ${countryName}. Aparecé primero, recibí alertas instantáneas y mostrá tu portfolio.`,
        robots: { index: true, follow: true },
    };
}

interface PlanCardProps {
    name: string;
    total: string;
    monthly: string | null;
    recommended: boolean;
    features: string[];
    cta: string;
    ctaHref: string;
}

function PlanCard({
    name,
    total,
    monthly,
    recommended,
    features,
    cta,
    ctaHref,
}: PlanCardProps): ReactElement {
    const isDark = recommended;
    return (
        <div
            className="relative rounded-xl p-6"
            style={{
                background: isDark ? 'var(--ink)' : 'var(--bg)',
                color: isDark ? 'var(--bg)' : 'var(--ink)',
                border: isDark ? 'none' : '1px solid var(--line)',
            }}
        >
            {recommended ? (
                <span
                    className="absolute left-1/2 -translate-x-1/2 rounded-full px-3 py-[3px] text-[10px] font-bold"
                    style={{
                        top: -10,
                        background: 'var(--accent-bright)',
                        color: 'var(--ink)',
                        letterSpacing: '0.08em',
                    }}
                >
                    MÁS POPULAR
                </span>
            ) : null}
            <div
                className="text-[13px] font-semibold"
                style={{
                    color: isDark ? 'color-mix(in srgb, var(--bg) 60%, transparent)' : 'var(--sub)',
                }}
            >
                {name}
            </div>
            <div
                className="mt-3 leading-none"
                style={{
                    fontSize: 34,
                    fontWeight: 500,
                    letterSpacing: '-0.03em',
                }}
            >
                {total}
            </div>
            <Mono
                className="mt-1 block text-[11px]"
                style={{
                    color: isDark ? 'color-mix(in srgb, var(--bg) 60%, transparent)' : 'var(--sub)',
                }}
            >
                {monthly ?? 'Total'}
            </Mono>
            <Link
                href={ctaHref}
                className="mt-4 mb-4 block w-full rounded-[9px] py-2.5 text-center text-[13px] font-semibold transition-opacity hover:opacity-90"
                style={{
                    background: isDark ? 'var(--bg)' : 'var(--ink)',
                    color: isDark ? 'var(--ink)' : 'var(--bg)',
                }}
            >
                {cta}
            </Link>
            <ul className="m-0 list-none p-0">
                {features.map((f) => (
                    <li
                        key={f}
                        className="flex items-start gap-2.5 py-1.5 text-[12.5px]"
                        style={{ color: isDark ? 'var(--bg)' : 'var(--ink)' }}
                    >
                        <span className="mt-0.5">
                            <Icon
                                name="check"
                                size={13}
                                stroke={isDark ? 'var(--accent-bright)' : 'var(--accent)'}
                            />
                        </span>
                        {f}
                    </li>
                ))}
            </ul>
        </div>
    );
}

const COMPARE_ROWS: [string, boolean, boolean][] = [
    ['Aparecer en búsquedas', true, true],
    ['Chat directo con clientes', true, true],
    ['Calificaciones de clientes', true, true],
    ['Sin comisión por trabajo', true, true],
    ['Posición destacada en búsquedas', false, true],
    ['Insignia "Pro"', false, true],
    ['Alertas instantáneas en tu zona', false, true],
    ['Portfolio con video', false, true],
    ['Stats avanzadas y exportables', false, true],
    ['Soporte telefónico prioritario', false, true],
    ['Banner en home del país (anual)', false, true],
];

interface BackendPrecio {
    id: string;
    duracionMeses: number;
    precio: number;
}

interface PlanViewModel {
    id: string;
    name: string;
    total: string;
    monthly: string | null;
    recommended: boolean;
    features: string[];
    cta: string;
    ctaHref: string;
}

function planName(duracion: number): string {
    if (duracion === 1) return 'Esencial · 1 mes';
    return `Pro · ${duracion} meses`;
}

function planCta(duracion: number): string {
    if (duracion === 1) return 'Probar 1 mes';
    return `Empezar ${duracion} meses`;
}

function buildPlanViewModel(plan: BackendPrecio, country: string): PlanViewModel {
    const monthly =
        plan.duracionMeses > 1
            ? `${formatPrice(Math.round(plan.precio / plan.duracionMeses), country)}/mes`
            : null;
    return {
        id: plan.id,
        name: planName(plan.duracionMeses),
        total: formatPrice(plan.precio, country),
        monthly,
        recommended: plan.duracionMeses === 3,
        features: planFeatures(plan.duracionMeses),
        cta: planCta(plan.duracionMeses),
        ctaHref: `/${country}/publicar?plan=${plan.id}`,
    };
}

function planFeatures(duracion: number): string[] {
    const base = ['Insignia Pro', 'Stats avanzadas', 'Alertas instantáneas en tu zona'];
    if (duracion === 1) return ['1 servicio destacado', 'Insignia Verificado', 'Stats básicas'];
    if (duracion === 3) return [...base, 'Hasta 4 servicios destacados'];
    if (duracion === 6) return [...base, 'Hasta 8 servicios destacados', 'Soporte prioritario'];
    return [
        'Servicios destacados ilimitados',
        ...base,
        'Soporte prioritario 24/7',
        'Banner en home (1 vez/año)',
    ];
}

export default async function SuscripcionProCountryPage({ params }: Props): Promise<ReactElement> {
    const { country } = await params;
    const precios = await obtenerPreciosPremiumActivos(country);

    return (
        <div style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
            <section className="mx-auto max-w-[1100px] px-6 pt-20 pb-12 text-center sm:px-10 lg:px-14">
                <SectionLabel>— HIREEO PRO</SectionLabel>
                <h1
                    className="m-0 mt-3.5 mb-5"
                    style={{
                        fontSize: 'clamp(40px, 6.5vw, 64px)',
                        fontWeight: 500,
                        letterSpacing: '-0.045em',
                        lineHeight: 0.96,
                        color: 'var(--ink)',
                    }}
                >
                    Para los que viven
                    <br /> del oficio.
                </h1>
                <p
                    className="m-0 mx-auto max-w-[580px] text-[17px] leading-[1.5]"
                    style={{ color: 'var(--sub)' }}
                >
                    Aparecé primero, recibí alertas instantáneas, mostrá tu trabajo con portfolio.
                    Cancelá cuando quieras.
                </p>
            </section>

            <section className="mx-auto max-w-site px-6 pb-16 sm:px-10 lg:px-14">
                {precios.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                        {precios.map((plan) => {
                            const vm = buildPlanViewModel(plan, country);
                            return (
                                <PlanCard
                                    key={vm.id}
                                    name={vm.name}
                                    total={vm.total}
                                    monthly={vm.monthly}
                                    recommended={vm.recommended}
                                    features={vm.features}
                                    cta={vm.cta}
                                    ctaHref={vm.ctaHref}
                                />
                            );
                        })}
                    </div>
                ) : (
                    <div
                        className="rounded-xl border p-12 text-center"
                        style={{ borderColor: 'var(--line)', background: 'var(--tint)' }}
                    >
                        <p className="m-0 text-[14px]" style={{ color: 'var(--sub)' }}>
                            Cargando planes disponibles…
                        </p>
                    </div>
                )}
            </section>

            <section className="mx-auto max-w-[1100px] px-6 pb-20 sm:px-10 lg:px-14">
                <SectionLabel>— COMPARÁ</SectionLabel>
                <h2
                    className="m-0 mt-3.5 mb-6"
                    style={{
                        fontSize: 'clamp(28px, 4vw, 38px)',
                        fontWeight: 500,
                        letterSpacing: '-0.03em',
                        color: 'var(--ink)',
                    }}
                >
                    Free vs Pro, en detalle.
                </h2>
                <div
                    className="overflow-hidden rounded-xl border bg-bg"
                    style={{ borderColor: 'var(--line)' }}
                >
                    <div
                        className="grid items-center px-5 py-3.5"
                        style={{
                            gridTemplateColumns: '1.5fr 1fr 1fr',
                            borderBottom: '1px solid var(--line)',
                            background: 'var(--tint)',
                        }}
                    >
                        <Mono
                            className="text-[11px] font-semibold"
                            style={{ color: 'var(--sub)', letterSpacing: '0.1em' }}
                        >
                            FUNCIONALIDAD
                        </Mono>
                        <div
                            className="text-center text-[13px] font-semibold"
                            style={{ color: 'var(--ink)' }}
                        >
                            Free
                        </div>
                        <div
                            className="text-center text-[13px] font-semibold"
                            style={{ color: 'var(--accent)' }}
                        >
                            Pro
                        </div>
                    </div>
                    {COMPARE_ROWS.map((row, i) => (
                        <div
                            key={row[0]}
                            className="grid items-center px-5 py-3"
                            style={{
                                gridTemplateColumns: '1.5fr 1fr 1fr',
                                borderBottom:
                                    i < COMPARE_ROWS.length - 1 ? '1px solid var(--line)' : 'none',
                            }}
                        >
                            <span className="text-[13.5px]" style={{ color: 'var(--ink)' }}>
                                {row[0]}
                            </span>
                            <div className="text-center">
                                {row[1] ? (
                                    <Icon name="check" size={14} stroke="var(--sub)" />
                                ) : (
                                    <span style={{ color: 'var(--muted)' }}>—</span>
                                )}
                            </div>
                            <div className="text-center">
                                {row[2] ? (
                                    <Icon
                                        name="check"
                                        size={14}
                                        stroke="var(--accent)"
                                        strokeWidth={2.4}
                                    />
                                ) : (
                                    <span style={{ color: 'var(--muted)' }}>—</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section
                className="border-t"
                style={{ borderColor: 'var(--line)', background: 'var(--tint)' }}
            >
                <div className="mx-auto max-w-[900px] px-6 py-16 text-center sm:px-10 lg:px-14">
                    <h3
                        className="m-0 mb-3"
                        style={{
                            fontSize: 28,
                            fontWeight: 500,
                            letterSpacing: '-0.025em',
                            color: 'var(--ink)',
                        }}
                    >
                        ¿Dudas sobre los planes?
                    </h3>
                    <p
                        className="m-0 mb-7 text-[15px]"
                        style={{ color: 'var(--sub)' }}
                    >
                        Te ayudamos a elegir el que mejor encaja con tu volumen de trabajo.
                    </p>
                    <Link href={`/${country}/contacto`}>
                        <Btn variant="primary" size="lg" iconRight="arrow">
                            Hablar con soporte
                        </Btn>
                    </Link>
                </div>
            </section>
        </div>
    );
}
