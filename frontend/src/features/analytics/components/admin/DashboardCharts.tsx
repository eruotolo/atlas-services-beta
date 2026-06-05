'use client';

import { useEffect, useState } from 'react';

import {
    Bar,
    BarChart,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface InteractionTypeData {
    name: string;
    value: number;
    color: string;
    label: string;
}

interface TopService {
    servicioId: string;
    titulo: string;
    total: number;
}

interface DashboardChartsProps {
    porTipo: Record<string, number>;
    topServicios: TopService[];
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const INTERACTION_META: Record<string, { label: string; color: string }> = {
    VIEW_PHONE: { label: 'Ver Teléfono', color: '#3B82F6' },
    VIEW_EMAIL: { label: 'Ver Email', color: '#8B5CF6' },
    CALL: { label: 'Llamar', color: '#10B981' },
    WHATSAPP: { label: 'WhatsApp', color: '#22C55E' },
    // Legacy keys (frontend may use spanish names)
    VER_TELEFONO: { label: 'Ver Teléfono', color: '#3B82F6' },
    VER_EMAIL: { label: 'Ver Email', color: '#8B5CF6' },
    LLAMAR: { label: 'Llamar', color: '#10B981' },
};

function mapPorTipo(porTipo: Record<string, number>): InteractionTypeData[] {
    return Object.entries(porTipo)
        .filter(([, v]) => v > 0)
        .map(([key, value]) => {
            const meta = INTERACTION_META[key] ?? { label: key, color: '#94A3B8' };
            return { name: key, value, color: meta.color, label: meta.label };
        })
        .sort((a, b) => b.value - a.value);
}

/* ------------------------------------------------------------------ */
/*  Custom tooltip                                                     */
/* ------------------------------------------------------------------ */

function ChartTooltip({ active, payload }: { active?: boolean; payload?: Array<{ value: number; payload: { label?: string; titulo?: string } }> }) {
    if (!active || !payload?.length) return null;
    const p = payload[0];
    return (
        <div className="rounded-xl border border-line bg-bg px-3 py-2 text-xs font-semibold shadow-lg">
            <span className="text-muted">{p.payload.label ?? p.payload.titulo}</span>
            <span className="ml-2 text-ink">{p.value.toLocaleString()}</span>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function DashboardCharts({ porTipo, topServicios }: DashboardChartsProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const typeData = mapPorTipo(porTipo);
    const topData = topServicios.slice(0, 7).map((s) => ({
        ...s,
        // Truncate long titles for chart
        titulo: s.titulo.length > 28 ? `${s.titulo.slice(0, 25)}…` : s.titulo,
    }));

    if (!mounted) {
        return (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="flex h-[320px] items-center justify-center rounded-xl border border-line bg-bg">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-accent" />
                </div>
                <div className="flex h-[320px] items-center justify-center rounded-xl border border-line bg-bg">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-accent" />
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Pie chart: Interactions by type */}
            <div className="rounded-xl border border-line bg-bg p-6">
                <h3 className="mb-4 font-mono text-sm font-black tracking-widest text-muted uppercase">
                    Interacciones por Tipo
                </h3>

                {typeData.length > 0 ? (
                    <div className="flex items-center gap-4">
                        <ResponsiveContainer width="50%" height={220}>
                            <PieChart>
                                <Pie
                                    data={typeData}
                                    dataKey="value"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={85}
                                    paddingAngle={3}
                                    strokeWidth={0}
                                >
                                    {typeData.map((entry) => (
                                        <Cell key={entry.name} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<ChartTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex flex-col gap-2">
                            {typeData.map((item) => (
                                <div key={item.name} className="flex items-center gap-2">
                                    <span
                                        className="h-3 w-3 rounded-full"
                                        style={{ backgroundColor: item.color }}
                                    />
                                    <span className="text-xs font-semibold text-sub">
                                        {item.label}
                                    </span>
                                    <span className="ml-auto text-xs font-black text-ink">
                                        {item.value.toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <p className="py-16 text-center text-sm text-muted italic">
                        Sin datos de interacciones aún
                    </p>
                )}
            </div>

            {/* Bar chart: Top services */}
            <div className="rounded-xl border border-line bg-bg p-6">
                <h3 className="mb-4 font-mono text-sm font-black tracking-widest text-muted uppercase">
                    Top Servicios Más Vistos
                </h3>

                {topData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={topData} layout="vertical" margin={{ left: 0, right: 16 }}>
                            <XAxis type="number" hide />
                            <YAxis
                                type="category"
                                dataKey="titulo"
                                width={140}
                                tick={{ fontSize: 11, fill: '#8E8E8E' }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip content={<ChartTooltip />} />
                            <Bar
                                dataKey="total"
                                radius={[0, 8, 8, 0]}
                                barSize={18}
                            >
                                {topData.map((_, idx) => (
                                    <Cell
                                        key={`bar-${idx}`}
                                        fill={idx === 0 ? '#2D4E8F' : idx === 1 ? '#5B8FD4' : '#A9C7E8'}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="py-16 text-center text-sm text-muted italic">
                        Sin datos de servicios aún
                    </p>
                )}
            </div>
        </div>
    );
}
