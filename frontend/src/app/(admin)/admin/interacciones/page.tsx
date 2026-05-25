import { BarChart3, Eye, Mail, MessageSquare, Phone } from 'lucide-react';

import { getInteracciones, getInteraccionesMetricas } from '@/features/analytics/actions';
import InteraccionesTable from '@/features/analytics/components/admin/InteraccionesTable';

interface PageProps {
    searchParams: Promise<{ page?: string; q?: string }>;
}

export default async function InteraccionesPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const page = Number(params.page) || 1;
    const search = params.q || '';

    const [report, result] = await Promise.all([
        getInteraccionesMetricas(),
        getInteracciones(page, 12, search),
    ]);

    if ('error' in report) {
        return (
            <div className="p-8 text-center text-red-500">
                Error al cargar las métricas: {String(report.error as string)}
            </div>
        );
    }

    const { totalGlobal, porTipo, topServicios } = report;

    return (
        <div className="animate-in fade-in space-y-8 duration-500">
            <div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white">
                    Reporte de Interacciones
                </h1>
                <div className="mt-1 flex items-center gap-2">
                    <p className="text-gray-500 dark:text-gray-400">
                        Monitoreo de actividad y retorno de inversión (ROI) de los servicios.
                    </p>
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        {totalGlobal} interacciones totales
                    </span>
                </div>
            </div>

            {/* Tarjetas de Resumen */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900/40">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/5 text-brand dark:bg-brand/10 dark:text-brand-light">
                            <Eye size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-400 uppercase">
                                Teléfonos Vistos
                            </p>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                                {porTipo.VER_TELEFONO || 0}
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900/40">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
                            <Mail size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-400 uppercase">
                                Emails Vistos
                            </p>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                                {porTipo.VER_EMAIL || 0}
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900/40">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                            <Phone size={24} className="fill-current" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-400 uppercase">
                                Intentos Llamada
                            </p>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                                {porTipo.LLAMAR || 0}
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900/40">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                            <MessageSquare size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-400 uppercase">
                                Clicks WhatsApp
                            </p>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                                {porTipo.WHATSAPP || 0}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Tabla de Interacciones con Paginación */}
                <div className="lg:col-span-2">
                    <InteraccionesTable result={result} />
                </div>

                {/* Top Servicios - Rendimiento Acumulado */}
                <div className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-gray-900/40">
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
                            <BarChart3 className="text-brand" /> Rendimiento por Servicio
                        </h2>
                        <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">
                            Top 10
                        </span>
                    </div>
                    <div className="space-y-5">
                        {topServicios.map((item, index) => (
                            <div
                                key={item.servicioId}
                                className="group relative flex items-center gap-4 rounded-2xl p-2 transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
                            >
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/5 font-black text-brand dark:bg-brand/10 dark:text-brand-light">
                                    #{index + 1}
                                </span>
                                <div className="flex-1 overflow-hidden">
                                    <div className="flex items-center justify-between gap-2">
                                        <h4 className="truncate text-sm font-black text-gray-900 dark:text-white">
                                            {item.titulo}
                                        </h4>
                                        <span className="text-sm font-black text-brand dark:text-brand-light">
                                            {item.total}{' '}
                                            <span className="text-[10px] font-bold tracking-tight text-gray-400 uppercase">
                                                clicks
                                            </span>
                                        </span>
                                    </div>
                                    <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                                        Proveedor: {item.proveedor}
                                    </p>
                                    <div className="mt-2 h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800">
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
                            <p className="py-10 text-center text-sm text-gray-500">
                                Sin datos suficientes para generar el ranking.
                            </p>
                        )}
                    </div>

                    <div className="mt-8 rounded-2xl border border-indigo-100 bg-indigo-50 p-5 dark:border-indigo-500/10 dark:bg-indigo-900/20">
                        <h5 className="mb-1 text-sm font-black text-indigo-900 dark:text-indigo-300">
                            Dato de Venta
                        </h5>
                        <p className="text-xs leading-relaxed text-indigo-700 italic dark:text-indigo-400">
                            &quot;Este reporte suma todas las veces que alguien intentó contactar al
                            profesional (vio su teléfono, email o clickeó en llamar/WhatsApp). Es la
                            prueba real de que la plataforma les genera prospectos.&quot;
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
