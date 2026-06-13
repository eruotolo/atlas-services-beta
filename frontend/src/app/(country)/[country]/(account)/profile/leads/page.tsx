import { redirect } from 'next/navigation';

import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getAvailableLeads, getMySentQuotes } from '@/features/services/actions/leads';
import { LeadCard } from '@/features/services/components/leads/LeadCard';
import { getProfilePageData } from '@/features/users/actions';
import { UserShell } from '@/features/users/components/account/UserShell';
import { Btn, Mono, Pill } from '@/shared/components/hireeo';

export const metadata: Metadata = {
    title: 'Leads disponibles · Hireeo',
    robots: { index: false, follow: false },
};

type Props = { params: Promise<{ country: string }> };

export default async function LeadsPage({ params }: Props) {
    const { country } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect(`/${country}/login`);
    }

    const [usuario, leads, sentQuotes] = await Promise.all([
        getProfilePageData(session.user.id),
        getAvailableLeads(),
        getMySentQuotes(),
    ]);

    if (!usuario) {
        redirect(`/${country}/login`);
    }

    const tienePremium = usuario.stats.premiumCount > 0;

    // Cotizaciones aceptadas (trabajos ganados)
    const wonJobs = sentQuotes.filter((q) => q.accepted);

    return (
        <UserShell
            country={country}
            user={{ name: usuario.name, avatar: usuario.avatar, isPremium: tienePremium }}
            counts={{ servicios: usuario.stats.totalServicios }}
        >
            {/* ── Page header ───────────────────────────────────────────── */}
            <div
                style={{
                    padding: '24px 28px 20px',
                    borderBottom: '1px solid var(--line)',
                    background: 'var(--bg)',
                }}
            >
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1
                            style={{
                                margin: 0,
                                fontSize: 22,
                                fontWeight: 600,
                                letterSpacing: '-0.025em',
                                color: 'var(--ink)',
                            }}
                        >
                            Solicitudes disponibles
                        </h1>
                        <Mono className="mt-1 text-[12px]" style={{ color: 'var(--sub)' }}>
                            Clientes que buscan profesionales en tu categoría
                        </Mono>
                    </div>
                    {/* Mini stats */}
                    <div className="flex items-center gap-3">
                        <div className="text-center">
                            <p
                                className="text-[22px] font-semibold tabular-nums"
                                style={{ color: 'var(--ink)', lineHeight: 1 }}
                            >
                                {leads.length}
                            </p>
                            <Mono className="text-[10px]" style={{ color: 'var(--sub)' }}>
                                DISPONIBLES
                            </Mono>
                        </div>
                        <div
                            style={{ width: 1, height: 32, background: 'var(--line)' }}
                            aria-hidden
                        />
                        <div className="text-center">
                            <p
                                className="text-[22px] font-semibold tabular-nums"
                                style={{ color: 'var(--ink)', lineHeight: 1 }}
                            >
                                {sentQuotes.length}
                            </p>
                            <Mono className="text-[10px]" style={{ color: 'var(--sub)' }}>
                                ENVIADAS
                            </Mono>
                        </div>
                        <div
                            style={{ width: 1, height: 32, background: 'var(--line)' }}
                            aria-hidden
                        />
                        <div className="text-center">
                            <p
                                className="text-[22px] font-semibold tabular-nums"
                                style={{ color: 'var(--accent)', lineHeight: 1 }}
                            >
                                {wonJobs.length}
                            </p>
                            <Mono className="text-[10px]" style={{ color: 'var(--sub)' }}>
                                GANADOS
                            </Mono>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Tabs content ──────────────────────────────────────────── */}
            <div style={{ padding: 28 }}>

                {/* ── Leads disponibles ───────────────────────────────── */}
                <section className="mb-8">
                    <h2
                        style={{
                            margin: '0 0 14px',
                            fontSize: 14,
                            fontWeight: 600,
                            color: 'var(--ink)',
                            letterSpacing: '-0.01em',
                        }}
                    >
                        Nuevas solicitudes
                    </h2>

                    {leads.length === 0 ? (
                        <NoLeadsEmpty country={country} />
                    ) : (
                        <div className="flex flex-col gap-3">
                            {leads.map((lead) => (
                                <LeadCard
                                    key={lead.id}
                                    lead={lead}
                                    countryCode={country}
                                />
                            ))}
                        </div>
                    )}
                </section>

                {/* ── Mis cotizaciones enviadas ────────────────────────── */}
                {sentQuotes.length > 0 ? (
                    <section>
                        <h2
                            style={{
                                margin: '0 0 14px',
                                fontSize: 14,
                                fontWeight: 600,
                                color: 'var(--ink)',
                                letterSpacing: '-0.01em',
                            }}
                        >
                            Mis cotizaciones enviadas
                        </h2>
                        <div className="flex flex-col gap-3">
                            {sentQuotes.map((q) => (
                                <div
                                    key={q.id}
                                    className="rounded-2xl"
                                    style={{
                                        border: `1px solid ${q.accepted ? 'color-mix(in srgb, var(--success) 35%, var(--line))' : 'var(--line)'}`,
                                        background: q.accepted
                                            ? 'color-mix(in srgb, var(--success) 5%, var(--bg))'
                                            : 'var(--tint)',
                                        padding: '14px 18px',
                                    }}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                            <p
                                                className="mb-1 truncate text-[13px] font-semibold"
                                                style={{ color: 'var(--ink)' }}
                                            >
                                                {q.serviceRequest.description}
                                            </p>
                                            <Mono
                                                className="text-[11px]"
                                                style={{ color: 'var(--sub)' }}
                                            >
                                                {q.serviceRequest.category.name}
                                            </Mono>
                                        </div>
                                        <div className="flex shrink-0 flex-col items-end gap-1">
                                            <p
                                                className="text-[16px] font-bold tabular-nums"
                                                style={{ color: 'var(--ink)' }}
                                            >
                                                {new Intl.NumberFormat('es-CL', {
                                                    style: 'currency',
                                                    currency: 'CLP',
                                                    maximumFractionDigits: 0,
                                                }).format(q.price)}
                                            </p>
                                            {q.accepted ? (
                                                <Pill tone="success">Aceptada ✓</Pill>
                                            ) : (
                                                <Pill tone="default">Pendiente</Pill>
                                            )}
                                        </div>
                                    </div>
                                    {q.message ? (
                                        <p
                                            className="mt-2 text-[12px] leading-relaxed"
                                            style={{ color: 'var(--sub)' }}
                                        >
                                            {q.message}
                                        </p>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    </section>
                ) : null}
            </div>
        </UserShell>
    );
}

/* ─── Empty state ──────────────────────────────────────────────────────────── */
function NoLeadsEmpty({ country }: { country: string }) {
    return (
        <div
            className="flex flex-col items-center justify-center text-center"
            style={{ paddingTop: 48, paddingBottom: 48, gap: 16 }}
        >
            <svg
                width="72"
                height="72"
                viewBox="0 0 72 72"
                fill="none"
                aria-hidden
                style={{ opacity: 0.3 }}
            >
                <circle cx="36" cy="36" r="32" stroke="var(--ink)" strokeWidth="2.5" />
                <path
                    d="M22 36h28M36 22v28"
                    stroke="var(--ink)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                />
            </svg>
            <div>
                <p
                    style={{
                        margin: 0,
                        fontSize: 15,
                        fontWeight: 600,
                        color: 'var(--ink)',
                    }}
                >
                    No hay solicitudes disponibles por ahora
                </p>
                <p
                    style={{
                        margin: '6px 0 0',
                        fontSize: 13,
                        color: 'var(--sub)',
                        maxWidth: 300,
                    }}
                >
                    Cuando un cliente busque un profesional en tu categoría, aparecerá aquí.
                </p>
            </div>
            <Btn variant="secondary" icon="search" href={`/${country}/profile`}>
                Volver al perfil
            </Btn>
        </div>
    );
}
