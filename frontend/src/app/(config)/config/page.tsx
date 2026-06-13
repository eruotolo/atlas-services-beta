import Link from 'next/link';

import { getInteracciones, getInteraccionesMetricas } from '@/features/analytics/actions';
import DashboardCharts from '@/features/analytics/components/admin/DashboardCharts';
import RecentActivity from '@/features/analytics/components/admin/RecentActivity';
import { getAdminCountries } from '@/features/configuration/countries/actions/queries';
import { CountriesOverview } from '@/features/configuration/countries/components/CountriesOverview';
import { getAdminServices } from '@/features/services/actions/queries';
import { getTodasSponsors } from '@/features/sponsors/actions/queries';
import { getAdminUsers } from '@/features/users/actions';
import { Icon, SectionLabel, Stat } from '@/shared/components/hireeo';
import type { HireIconName } from '@/shared/components/hireeo/icons';
import { formatCurrency } from '@/shared/lib/utils';

interface DashboardStats {
    servicios: number;
    usuarios: number;
    ingresosBrutos: string;
    ingresosNetos: string;
    sponsorsActivos: number;
    metricas: {
        totalGlobal: number;
        porTipo: Record<string, number>;
        topServicios: Array<{ servicioId: string; titulo: string; total: number }>;
    };
}

async function getDashboardStats(): Promise<DashboardStats> {
    try {
        const [usersData, servicesData, metricas] = await Promise.all([
            getAdminUsers(1, 1),
            getAdminServices(1, 1),
            getInteraccionesMetricas(),
        ]);

        const sponsorsAll = await getTodasSponsors(1, 100);
        const sponsorsActivos = sponsorsAll.data.filter((s) => s.activo).length;

        return {
            servicios: servicesData?.meta?.total ?? 0,
            usuarios: usersData?.meta?.total ?? 0,
            ingresosBrutos: formatCurrency(0),
            ingresosNetos: formatCurrency(0),
            sponsorsActivos,
            metricas: {
                totalGlobal: metricas.totalGlobal,
                porTipo: metricas.porTipo,
                topServicios: metricas.topServicios,
            },
        };
    } catch (e) {
        console.error('Error loading dashboard stats:', e);
        return {
            servicios: 0,
            usuarios: 0,
            ingresosBrutos: formatCurrency(0),
            ingresosNetos: formatCurrency(0),
            sponsorsActivos: 0,
            metricas: { totalGlobal: 0, porTipo: {}, topServicios: [] },
        };
    }
}

async function getRecentInteractions() {
    try {
        return await getInteracciones(1, 8);
    } catch {
        return { data: [], meta: { total: 0, page: 1, limit: 8, totalPages: 0 } };
    }
}

export default async function ConfigDashboardPage() {
    const [stats, recent, countries] = await Promise.all([
        getDashboardStats(),
        getRecentInteractions(),
        getAdminCountries(),
    ]);

    const activeCountries = countries.filter((c) => c.active).length;

    const statsCards: Array<{ label: string; value: string; sub: string; icon: HireIconName }> = [
        {
            label: 'Países Activos',
            value: activeCountries.toLocaleString(),
            sub: `de ${countries.length} configurados`,
            icon: 'globe',
        },
        {
            label: 'Servicios Publicados',
            value: stats.servicios.toLocaleString(),
            sub: 'todos los países',
            icon: 'hammer',
        },
        {
            label: 'Usuarios Registrados',
            value: stats.usuarios.toLocaleString(),
            sub: 'todos los países',
            icon: 'users',
        },
        {
            label: 'Total Interacciones',
            value: stats.metricas.totalGlobal.toLocaleString(),
            sub: 'vistas, llamadas y contactos',
            icon: 'eye',
        },
        {
            label: 'Sponsors Activos',
            value: stats.sponsorsActivos.toLocaleString(),
            sub: 'campañas en curso',
            icon: 'bell',
        },
    ];

    return (
        <div className="w-full p-7">
            <div className="animate-in fade-in slide-in-from-bottom-4 flex flex-col gap-8 duration-700">
                {/* 1. Métricas Globales (Top Row) */}
                <section className="stagger-item">
                    <div className="mb-5">
                        <SectionLabel>Métricas globales</SectionLabel>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                        {statsCards.map((stat) => (
                            <Stat
                                key={stat.label}
                                label={stat.label}
                                value={stat.value}
                                sub={stat.sub}
                                icon={stat.icon}
                            />
                        ))}
                    </div>
                </section>

                {/* 2. Bento Grid Central: Gráficos y Actividad */}
                <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
                    {/* Columna Izquierda: Gráficos (8 columnas) */}
                    <div className="xl:col-span-8">
                        <section className="stagger-item h-full rounded-2xl border border-line bg-bg/80 p-6 shadow-sm backdrop-blur-md transition-all dark:bg-tint/40">
                            <div className="mb-6">
                                <SectionLabel>Interacciones y Rendimiento</SectionLabel>
                            </div>
                            <DashboardCharts
                                porTipo={stats.metricas.porTipo}
                                topServicios={stats.metricas.topServicios}
                            />
                        </section>
                    </div>

                    {/* Columna Derecha: Actividad Reciente (4 columnas) */}
                    <div className="xl:col-span-4">
                        <section className="stagger-item h-full rounded-2xl border border-line bg-bg/80 p-6 shadow-sm backdrop-blur-md transition-all dark:bg-tint/40">
                            <div className="mb-6">
                                <SectionLabel>Actividad Reciente</SectionLabel>
                            </div>
                            <div className="rounded-xl border border-line/50 bg-tint/30 p-4 shadow-inner dark:bg-tint-warm/10">
                                <RecentActivity interactions={recent.data} />
                            </div>
                        </section>
                    </div>
                </div>

                {/* 3. Países (Ancho completo) */}
                <section className="stagger-item">
                    <div className="mb-5 flex items-center justify-between">
                        <SectionLabel>Países de la plataforma</SectionLabel>
                        <Link
                            href="/config/countries"
                            className="inline-flex items-center gap-1.5 rounded-full bg-tint px-4 py-1.5 text-[12px] font-medium text-sub transition-colors hover:bg-line hover:text-ink dark:bg-tint-warm dark:hover:bg-line"
                        >
                            Gestionar países
                            <Icon name="arrow" size={11} />
                        </Link>
                    </div>
                    {/* Al darle su propio espacio completo, los 5 grid-cols funcionarán perfecto */}
                    <CountriesOverview countries={countries} />
                </section>
            </div>
        </div>
    );
}
