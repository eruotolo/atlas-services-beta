import { redirect } from 'next/navigation';

import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getMyServiceRequests, getQuotesByRequest } from '@/features/services/actions/quotes';
import { ServiceRequestCard } from '@/features/services/components/quotes/ServiceRequestCard';
import { getProfilePageData } from '@/features/users/actions';

import { Btn, Mono } from '@/shared/components/hireeo';
import { PageHeader } from '@/shared/components/hireeo';

export const metadata: Metadata = {
    title: 'Mis cotizaciones · Hireeo',
    robots: { index: false, follow: false },
};

type Props = { params: Promise<{ country: string }> };

export default async function CotizacionesPage({ params }: Props) {
    const { country } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect(`/${country}/login`);
    }

    const [usuario, requests] = await Promise.all([
        getProfilePageData(session.user.id),
        getMyServiceRequests(),
    ]);

    if (!usuario) {
        redirect(`/${country}/login`);
    }

    const tienePremium = usuario.stats.premiumCount > 0;

    // Fetch quotes for every request in parallel
    const requestsWithQuotes = await Promise.all(
        requests.map(async (req) => ({
            request: req,
            quotes: await getQuotesByRequest(req.id),
        })),
    );

    const isEmpty = requestsWithQuotes.length === 0;

    return (
        <>
            <PageHeader
                breadcrumb={['Mi cuenta', 'Cotizaciones']}
                title="Mis cotizaciones"
                subtitle={isEmpty
                        ? 'Aún no enviaste solicitudes de servicio'
                        : `${requestsWithQuotes.length} solicitud${requestsWithQuotes.length !== 1 ? 'es' : ''} · ${requestsWithQuotes.reduce((acc, rq) => acc + rq.quotes.length, 0)} cotización${requestsWithQuotes.reduce((acc, rq) => acc + rq.quotes.length, 0) !== 1 ? 'es' : ''} recibidas`
                }
            />

            {/* ── Content ────────────────────────────────────────────────── */}
            <div style={{ padding: 28 }}>
                {isEmpty ? (
                    <EmptyState country={country} />
                ) : (
                    <div className="flex flex-col gap-0">
                        {requestsWithQuotes.map(({ request, quotes }) => (
                            <ServiceRequestCard
                                key={request.id}
                                request={request}
                                quotes={quotes}
                                country={country}
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

/* ─── Empty state ──────────────────────────────────────────────────────────── */
function EmptyState({ country }: { country: string }) {
    return (
        <div
            className="flex flex-col items-center justify-center text-center"
            style={{ paddingTop: 64, paddingBottom: 64, gap: 20 }}
        >
            {/* Ilustración SVG inline */}
            <svg
                width="80"
                height="80"
                viewBox="0 0 80 80"
                fill="none"
                aria-hidden="true"
                style={{ opacity: 0.35 }}
            >
                <rect
                    x="8"
                    y="12"
                    width="64"
                    height="56"
                    rx="10"
                    stroke="var(--ink)"
                    strokeWidth="2.5"
                />
                <path
                    d="M8 28h64"
                    stroke="var(--ink)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                />
                <rect
                    x="18"
                    y="38"
                    width="22"
                    height="4"
                    rx="2"
                    fill="var(--ink)"
                />
                <rect
                    x="18"
                    y="48"
                    width="14"
                    height="4"
                    rx="2"
                    fill="var(--ink)"
                />
                <circle cx="58" cy="52" r="10" fill="var(--accent-soft)" />
                <path
                    d="M54 52l3 3 5-5"
                    stroke="var(--accent)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>

            <div>
                <p
                    style={{
                        margin: 0,
                        fontSize: 16,
                        fontWeight: 600,
                        color: 'var(--ink)',
                        letterSpacing: '-0.01em',
                    }}
                >
                    Todavía no solicitaste ningún servicio
                </p>
                <p
                    style={{
                        margin: '6px 0 0',
                        fontSize: 13,
                        color: 'var(--sub)',
                        maxWidth: 320,
                    }}
                >
                    Buscá un profesional, describí lo que necesitás y empezá a recibir cotizaciones
                    en minutos.
                </p>
            </div>

            <Btn variant="accent" icon="search" href={`/${country}`}>
                Buscar profesionales
            </Btn>
        </div>
    );
}
