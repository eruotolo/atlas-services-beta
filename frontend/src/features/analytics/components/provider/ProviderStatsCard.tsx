'use client';

import { BarChart3, Eye, MessageCircle, Mouse, Phone, PhoneCall, Share2 } from 'lucide-react';

import type { ServiceStatItem } from '@/features/analytics/actions/queries';

/* ------------------------------------------------------------------ */
/*  Type → label / icon / color mapping                                */
/* ------------------------------------------------------------------ */

const STAT_CONFIG: Record<
    string,
    { label: string; icon: typeof Eye; color: string; bgColor: string }
> = {
    VIEW_PHONE: {
        label: 'Vieron teléfono',
        icon: Phone,
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-500',
    },
    VIEW_PROFILE: {
        label: 'Visitas al perfil',
        icon: Eye,
        color: 'text-indigo-600 dark:text-indigo-400',
        bgColor: 'bg-indigo-500',
    },
    CALL: {
        label: 'Llamadas',
        icon: PhoneCall,
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-500',
    },
    WHATSAPP: {
        label: 'WhatsApp',
        icon: MessageCircle,
        color: 'text-emerald-600 dark:text-emerald-400',
        bgColor: 'bg-emerald-500',
    },
    CLICK: {
        label: 'Clics en servicio',
        icon: Mouse,
        color: 'text-violet-600 dark:text-violet-400',
        bgColor: 'bg-violet-500',
    },
    SHARE: {
        label: 'Compartido',
        icon: Share2,
        color: 'text-amber-600 dark:text-amber-400',
        bgColor: 'bg-amber-500',
    },
};

const DEFAULT_CONFIG = {
    label: 'Otra interacción',
    icon: BarChart3,
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-500',
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface ProviderStatsCardProps {
    servicioTitulo: string;
    stats: ServiceStatItem[];
}

export default function ProviderStatsCard({ servicioTitulo, stats }: ProviderStatsCardProps) {
    const totalInteractions = stats.reduce((sum, s) => sum + s.total, 0);
    const maxStat = Math.max(...stats.map((s) => s.total), 1);

    if (totalInteractions === 0) {
        return (
            <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900/40">
                <div className="mb-3 flex items-center gap-2">
                    <BarChart3 size={18} className="text-gray-400" />
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                        {servicioTitulo}
                    </h4>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                    Aún no hay interacciones registradas para este servicio.
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-white/10 dark:bg-gray-900/40 dark:shadow-none">
            {/* Header */}
            <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                        <BarChart3 size={16} />
                    </div>
                    <h4 className="max-w-[180px] truncate text-sm font-bold text-gray-900 dark:text-white">
                        {servicioTitulo}
                    </h4>
                </div>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-black text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                    {totalInteractions.toLocaleString()} total
                </span>
            </div>

            {/* Progress bars */}
            <div className="space-y-3.5">
                {stats
                    .sort((a, b) => b.total - a.total)
                    .map((stat) => {
                        const config = STAT_CONFIG[stat.type] ?? DEFAULT_CONFIG;
                        const Icon = config.icon;
                        const percentage = Math.round((stat.total / maxStat) * 100);

                        return (
                            <div key={stat.type}>
                                <div className="mb-1.5 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Icon size={14} className={config.color} />
                                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                            {config.label}
                                        </span>
                                    </div>
                                    <span className="text-xs font-black text-gray-900 dark:text-white">
                                        {stat.total.toLocaleString()}
                                    </span>
                                </div>
                                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                                    <div
                                        className={`h-full rounded-full ${config.bgColor} transition-all duration-700 ease-out`}
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
            </div>
        </div>
    );
}
