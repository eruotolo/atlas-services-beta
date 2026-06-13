import type { ReactElement } from 'react';

import { Icon } from '@/shared/components/hireeo';

interface TopServicio {
    servicioId: string;
    titulo: string;
    total: number;
    proveedor?: string;
}

interface TopServiciosPanelProps {
    topServicios: TopServicio[];
}

/** Ranking de servicios por interacciones (top 10) para dashboards admin. */
export function TopServiciosPanel({ topServicios }: TopServiciosPanelProps): ReactElement {
    const maxTotal = topServicios[0]?.total || 1;

    return (
        <div className="flex h-full flex-col">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-[15px] font-semibold tracking-[-0.01em] text-ink">
                    <Icon name="trend" size={16} className="text-brand" /> Rendimiento por
                    Servicio
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
                            {item.proveedor ? (
                                <p className="text-[11px] font-medium text-sub">
                                    Proveedor: {item.proveedor}
                                </p>
                            ) : null}
                            <div className="mt-2 h-1.5 w-full rounded-full bg-line">
                                <div
                                    className="h-1.5 rounded-full bg-gradient-to-r from-brand/50 to-indigo-500"
                                    style={{ width: `${(item.total / maxTotal) * 100}%` }}
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
        </div>
    );
}
