import { redirect } from 'next/navigation';

import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getKycStatus } from '@/features/users/actions/kyc';
import { getProfilePageData } from '@/features/users/actions';

import { KycStatusBanner } from '@/features/users/components/kyc/KycStatusBanner';
import { KycInitiateButton } from '@/features/users/components/kyc/KycInitiateButton';
import { Card, Icon, Mono, Pill } from '@/shared/components/hireeo';
import { PageHeader } from '@/shared/components/hireeo';

export const metadata: Metadata = {
    title: 'Verificación de identidad — Hireeo',
    robots: { index: false, follow: false },
};

type Props = { params: Promise<{ country: string }> };

// ─── Paso del proceso ──────────────────────────────────────────────────────────

interface StepProps {
    number: number;
    title: string;
    description: string;
    iconName: 'shieldCheck' | 'cam' | 'sparkle';
    done?: boolean;
}

function ProcessStep({ number, title, description, iconName, done }: StepProps) {
    return (
        <div className="flex items-start gap-4">
            <div className="relative shrink-0">
                <div
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{
                        background: done
                            ? 'color-mix(in srgb, var(--success) 12%, var(--bg))'
                            : 'var(--tint)',
                        border: `2px solid ${done ? 'color-mix(in srgb, var(--success) 35%, transparent)' : 'var(--line)'}`,
                    }}
                >
                    {done ? (
                        <Icon name="check" size={16} stroke="var(--success)" />
                    ) : (
                        <span
                            className="text-[13px] font-bold"
                            style={{ color: 'var(--accent)' }}
                        >
                            {number}
                        </span>
                    )}
                </div>
            </div>
            <div className="flex-1 pt-1">
                <div className="flex items-center gap-2">
                    <Icon name={iconName} size={15} stroke="var(--accent)" />
                    <span
                        className="text-[14px] font-semibold"
                        style={{ color: 'var(--ink)' }}
                    >
                        {title}
                    </span>
                    {done ? <Pill tone="success" icon="check">Completado</Pill> : null}
                </div>
                <p
                    className="mt-1 text-[13px] leading-relaxed"
                    style={{ color: 'var(--sub)', maxWidth: 420 }}
                >
                    {description}
                </p>
            </div>
        </div>
    );
}

// ─── Ítem de documento aceptado ───────────────────────────────────────────────

function DocItem({ label }: { label: string }) {
    return (
        <div
            className="flex items-center gap-2 rounded-lg px-3 py-2"
            style={{ background: 'var(--tint)', border: '1px solid var(--line)' }}
        >
            <Icon name="check" size={13} stroke="var(--success)" />
            <span className="text-[13px]" style={{ color: 'var(--ink)' }}>
                {label}
            </span>
        </div>
    );
}

// ─── Página ────────────────────────────────────────────────────────────────────

export default async function VerificacionPage({ params }: Props) {
    const { country } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect(`/${country}/login`);
    }

    const [usuario, kycStatus] = await Promise.all([
        getProfilePageData(session.user.id),
        getKycStatus(),
    ]);

    if (!usuario) {
        redirect(`/${country}/login`);
    }

    const tienePremium = usuario.stats.premiumCount > 0;
    const isVerified = kycStatus?.isKycVerified ?? false;
    const verifiedAt = kycStatus?.kycVerifiedAt ?? null;

    return (
        <>
            <PageHeader
                breadcrumb={['Mi cuenta', 'Verificación']}
                title="Verificación de identidad"
                subtitle="Confirmá quién sos y generá más confianza en tus clientes"
                actions={
                    isVerified ? (
                        <Pill tone="success" icon="shieldCheck">IDENTIDAD VERIFICADA</Pill>
                    ) : (
                        <Pill tone="warning">PENDIENTE</Pill>
                    )
                }
            />

            <div style={{ padding: '28px', maxWidth: 820 }}>

                {/* ── Sección 1 — Estado actual ─────────────────────────────── */}
                <section className="mb-6">
                    <Mono
                        className="mb-3 block text-[10px] font-semibold"
                        style={{ color: 'var(--muted)', letterSpacing: '0.12em' }}
                    >
                        ESTADO ACTUAL
                    </Mono>

                    <KycStatusBanner isVerified={isVerified} verifiedAt={verifiedAt} />

                    {!isVerified && (
                        <div
                            className="mt-4 rounded-[14px] border p-5"
                            style={{
                                background: 'color-mix(in srgb, var(--accent) 4%, var(--bg))',
                                borderColor: 'color-mix(in srgb, var(--accent) 15%, transparent)',
                            }}
                        >
                            <h3
                                className="m-0 mb-2 text-[14px] font-semibold"
                                style={{ color: 'var(--ink)' }}
                            >
                                ¿Por qué verificar tu identidad?
                            </h3>
                            <ul
                                className="m-0 space-y-2 pl-0"
                                style={{ listStyle: 'none' }}
                            >
                                {[
                                    'Tu perfil muestra el badge "Identidad Verificada" que genera más confianza',
                                    'Los clientes prefieren contratar profesionales verificados',
                                    'Accedés a funciones exclusivas como postular a leads premium',
                                    'Es un proceso rápido: solo 2-3 minutos con tu documento',
                                ].map((item) => (
                                    <li
                                        key={item}
                                        className="flex items-start gap-2 text-[13px]"
                                        style={{ color: 'var(--sub)' }}
                                    >
                                        <Icon
                                            name="check"
                                            size={14}
                                            stroke="var(--accent)"
                                            className="mt-0.5 shrink-0"
                                        />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </section>

                {/* ── Sección 2 — Pasos del proceso ────────────────────────── */}
                <section className="mb-6">
                    <Mono
                        className="mb-3 block text-[10px] font-semibold"
                        style={{ color: 'var(--muted)', letterSpacing: '0.12em' }}
                    >
                        CÓMO FUNCIONA
                    </Mono>
                    <Card padding={24}>
                        <div className="space-y-6">
                            <ProcessStep
                                number={1}
                                title="Iniciá el proceso"
                                description="Hacé clic en el botón de abajo. Serás redirigido de forma segura a Stripe Identity, nuestro proveedor de verificación de identidad certificado."
                                iconName="shieldCheck"
                                done={isVerified}
                            />
                            <div
                                aria-hidden
                                className="ml-5 h-px"
                                style={{ background: 'var(--line)' }}
                            />
                            <ProcessStep
                                number={2}
                                title="Fotografiá tu documento"
                                description="Sacá una foto de tu DNI, pasaporte o cédula de identidad vigente. También necesitarás una selfie. El proceso tarda entre 2 y 3 minutos."
                                iconName="cam"
                                done={isVerified}
                            />
                            <div
                                aria-hidden
                                className="ml-5 h-px"
                                style={{ background: 'var(--line)' }}
                            />
                            <ProcessStep
                                number={3}
                                title="Recibís tu badge verificado"
                                description="En minutos (o a lo sumo 24 hs) recibirás el badge &quot;Identidad Verificada&quot; en tu perfil. Los clientes lo verán en tus servicios."
                                iconName="sparkle"
                                done={isVerified}
                            />
                        </div>
                    </Card>
                </section>

                {/* ── Sección 3 — CTA ──────────────────────────────────────── */}
                {!isVerified && (
                    <section className="mb-6">
                        <Mono
                            className="mb-3 block text-[10px] font-semibold"
                            style={{ color: 'var(--muted)', letterSpacing: '0.12em' }}
                        >
                            COMENZAR AHORA
                        </Mono>
                        <Card padding={28}>
                            <div className="flex flex-col gap-4">
                                <div>
                                    <h2
                                        className="m-0 mb-1 text-[16px] font-semibold"
                                        style={{ letterSpacing: '-0.01em', color: 'var(--ink)' }}
                                    >
                                        Verificá tu identidad en minutos
                                    </h2>
                                    <p
                                        className="m-0 text-[13px]"
                                        style={{ color: 'var(--sub)' }}
                                    >
                                        Al hacer clic serás redirigido a Stripe Identity, una plataforma
                                        segura y certificada para la verificación de documentos.
                                    </p>
                                </div>
                                <KycInitiateButton />
                            </div>
                        </Card>
                    </section>
                )}

                {/* ── Sección 4 — Información ──────────────────────────────── */}
                <section>
                    <Mono
                        className="mb-3 block text-[10px] font-semibold"
                        style={{ color: 'var(--muted)', letterSpacing: '0.12em' }}
                    >
                        INFORMACIÓN IMPORTANTE
                    </Mono>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                        {/* Documentos aceptados */}
                        <Card padding={20}>
                            <div className="mb-3 flex items-center gap-2">
                                <Icon name="fileText" size={16} stroke="var(--accent)" />
                                <span
                                    className="text-[13px] font-semibold"
                                    style={{ color: 'var(--ink)' }}
                                >
                                    Documentos aceptados
                                </span>
                            </div>
                            <div className="space-y-2">
                                <DocItem label="DNI (frente y dorso)" />
                                <DocItem label="Pasaporte vigente" />
                                <DocItem label="Cédula de identidad" />
                                <DocItem label="Licencia de conducir" />
                            </div>
                        </Card>

                        {/* Tiempo estimado */}
                        <Card padding={20}>
                            <div className="mb-3 flex items-center gap-2">
                                <Icon name="clock" size={16} stroke="var(--accent)" />
                                <span
                                    className="text-[13px] font-semibold"
                                    style={{ color: 'var(--ink)' }}
                                >
                                    Tiempo estimado
                                </span>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <span
                                        className="text-[28px] font-semibold"
                                        style={{
                                            letterSpacing: '-0.03em',
                                            color: 'var(--ink)',
                                        }}
                                    >
                                        2–3
                                    </span>
                                    <Mono
                                        className="ml-1.5 text-[11px]"
                                        style={{ color: 'var(--sub)' }}
                                    >
                                        MINUTOS
                                    </Mono>
                                    <p
                                        className="mt-1 text-[12px]"
                                        style={{ color: 'var(--sub)' }}
                                    >
                                        para completar el formulario
                                    </p>
                                </div>
                                <div
                                    className="h-px"
                                    style={{ background: 'var(--line)' }}
                                />
                                <div>
                                    <span
                                        className="text-[20px] font-semibold"
                                        style={{
                                            letterSpacing: '-0.02em',
                                            color: 'var(--ink)',
                                        }}
                                    >
                                        &lt; 24 hs
                                    </span>
                                    <p
                                        className="mt-1 text-[12px]"
                                        style={{ color: 'var(--sub)' }}
                                    >
                                        para recibir el resultado
                                    </p>
                                </div>
                            </div>
                        </Card>

                        {/* Privacidad */}
                        <Card padding={20}>
                            <div className="mb-3 flex items-center gap-2">
                                <Icon name="shield" size={16} stroke="var(--accent)" />
                                <span
                                    className="text-[13px] font-semibold"
                                    style={{ color: 'var(--ink)' }}
                                >
                                    Privacidad y seguridad
                                </span>
                            </div>
                            <ul
                                className="m-0 space-y-2 pl-0"
                                style={{ listStyle: 'none' }}
                            >
                                {[
                                    'Proceso encriptado con TLS 1.3',
                                    'Datos procesados por Stripe (PCI DSS)',
                                    'No almacenamos imágenes de tu documento',
                                    'Solo confirmamos que sos vos',
                                ].map((item) => (
                                    <li
                                        key={item}
                                        className="flex items-start gap-1.5 text-[12.5px]"
                                        style={{ color: 'var(--sub)' }}
                                    >
                                        <Icon
                                            name="check"
                                            size={12}
                                            stroke="var(--success)"
                                            className="mt-0.5 shrink-0"
                                        />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    </div>

                    {/* Nota legal */}
                    <div
                        className="mt-4 flex items-start gap-2 rounded-lg px-4 py-3"
                        style={{
                            background: 'var(--tint)',
                            border: '1px solid var(--line)',
                        }}
                    >
                        <Icon name="info" size={14} stroke="var(--muted)" className="mt-0.5 shrink-0" />
                        <p className="m-0 text-[12px]" style={{ color: 'var(--muted)' }}>
                            La verificación de identidad es voluntaria. Tus datos son procesados por{' '}
                            <strong>Stripe Identity</strong> de conformidad con las leyes de protección
                            de datos aplicables. Podés solicitar la eliminación de tus datos en cualquier
                            momento contactando a nuestro soporte.
                        </p>
                    </div>
                </section>
            </div>
        </>
    );
}
