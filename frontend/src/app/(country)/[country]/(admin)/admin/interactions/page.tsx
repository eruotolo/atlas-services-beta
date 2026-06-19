import { BarChart3, Eye, Mail, MessageSquare, Phone } from '@/shared/components/icons';

import { getInteracciones, getInteraccionesMetricas } from '@/features/analytics/actions';
import InteraccionesTable from '@/features/analytics/components/admin/InteraccionesTable';
import { PageHeader } from '@/shared/components/hireeo';
import { getDictionary } from '@/lib/i18n/getDictionary';

type Props = {
    params: Promise<{ country: string }>;
    searchParams: Promise<{ page?: string; q?: string }>;
};

export default async function InteraccionesPage({ params, searchParams }: Props) {
    const { country } = await params;
    const sp = await searchParams;
    const page = Number(sp.page) || 1;
    const search = sp.q || '';

    const dictionary = await getDictionary(country);
    const dict = dictionary.admin.sidebar;

    const [report, result] = await Promise.all([
        getInteraccionesMetricas(country),
        getInteracciones(page, 12, search, country),
    ]);

    if ('error' in report) {
        return (
            <>
                <PageHeader
                    breadcrumb={[dict.overview || 'Admin', dict.interactions || 'Interacciones']}
                    title={dict.interactions || 'Interacciones'}
                    subtitle="Vistas, clics y conversiones por servicio."
                />
                <div style={{ padding: 28 }} className="text-center text-red-500">
                    Error al cargar las métricas: {String(report.error as string)}
                </div>
            </>
        );
    }

    const { totalGlobal, porTipo, topServicios } = report;

    return (
        <>
            <PageHeader
                breadcrumb={[dict.overview || 'Admin', dict.interactions || 'Interacciones']}
                title={dict.interactions || 'Interacciones'}
                subtitle={`${totalGlobal} interacciones totales · Monitoreo de ROI por servicio`}
            />
            <div style={{ padding: 28 }}>
                <div className="animate-in fade-in space-y-8 duration-500">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-2xl border border-line bg-bg p-6 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/5 text-brand dark:bg-brand/10 dark:text-brand-light">
                                    <Eye size={24} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-muted uppercase">
                                        Teléfonos Vistos
                                    </p>
                                    <h3 className="text-2xl font-black text-ink">
                                        {porTipo.VER_TELEFONO || 0}
                                    </h3>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-line bg-bg p-6 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-muted uppercase">
                                        Emails Vistos
                                    </p>
                                    <h3 className="text-2xl font-black text-ink">
                                        {porTipo.VER_EMAIL || 0}
                                    </h3>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-line bg-bg p-6 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                                    <Phone size={24} className="fill-current" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-muted uppercase">
                                        Intentos Llamada
                                    </p>
                                    <h3 className="text-2xl font-black text-ink">
                                        {porTipo.LLAMAR || 0}
                                    </h3>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-line bg-bg p-6 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                                    <MessageSquare size={24} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-muted uppercase">
                                        Clicks WhatsApp
                                    </p>
                                    <h3 className="text-2xl font-black text-ink">
                                        {porTipo.WHATSAPP || 0}
                                    </h3>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                            <InteraccionesTable result={result} />
                        </div>

                        <div className="rounded-[2rem] border border-line bg-bg p-8 shadow-sm">
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="flex items-center gap-2 text-xl font-bold text-ink">
                                    <BarChart3 size={24} className="text-brand" /> Rendimiento por Servicio
                                </h2>
                                <span className="text-xs font-bold tracking-widest text-muted uppercase">
                                    Top 10
                                </span>
                            </div>
                            <div className="space-y-5">
                                {topServicios.map((item, index) => (
                                    <div
                                        key={item.servicioId}
                                        className="group relative flex items-center gap-4 rounded-2xl p-2 transition-colors hover:bg-tint"
                                    >
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/5 font-black text-brand dark:bg-brand/10 dark:text-brand-light">
                                            #{index + 1}
                                        </span>
                                        <div className="flex-1 overflow-hidden">
                                            <div className="flex items-center justify-between gap-2">
                                                <h4 className="truncate text-sm font-black text-ink">
                                                    {item.titulo}
                                                </h4>
                                                <span className="text-sm font-black text-brand dark:text-brand-light">
                                                    {item.total}{' '}
                                                    <span className="text-[10px] font-bold tracking-tight text-muted uppercase">
                                                        clicks
                                                    </span>
                                                </span>
                                            </div>
                                            <p className="text-[11px] font-medium text-sub">
                                                Proveedor: {item.proveedor}
                                            </p>
                                            <div className="mt-2 h-1.5 w-full rounded-full bg-line">
                                                <div
                                                    className="h-1.5 rounded-full bg-gradient-to-r from-brand/50 to-indigo-500"
                                                    style={{
                                                        width: `${(item.total / (topServicios[0]?.total || 1)) * 100}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {topServicios.length === 0 && (
                                    <p className="py-10 text-center text-sm text-muted">
                                        Sin datos suficientes para generar el ranking.
                                    </p>
                                )}
                            </div>

                            <div className="mt-8 rounded-2xl border border-indigo-100 bg-indigo-50 p-5 dark:border-indigo-500/10 dark:bg-indigo-900/20">
                                <h5 className="mb-1 text-sm font-black text-indigo-900 dark:text-indigo-300">
                                    Dato de Venta
                                </h5>
                                <p className="text-xs leading-relaxed text-indigo-700 italic dark:text-indigo-400">
                                    &quot;Este reporte suma todas las veces que alguien intentó
                                    contactar al profesional (vio su teléfono, email o clickeó en
                                    llamar/WhatsApp). Es la prueba real de que la plataforma les
                                    genera prospectos.&quot;
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
