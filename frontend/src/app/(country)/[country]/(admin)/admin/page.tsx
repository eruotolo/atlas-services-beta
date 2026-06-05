import { Eye, Hammer, Megaphone, Users } from 'lucide-react';

import { COUNTRY_SEO_CONFIG } from '@/features/geo/lib/countryUtils';
import { getInteracciones, getInteraccionesMetricas } from '@/features/analytics/actions';
import DashboardCharts from '@/features/analytics/components/admin/DashboardCharts';
import RecentActivity from '@/features/analytics/components/admin/RecentActivity';
import { getAdminServices } from '@/features/services/actions/queries';
import { getTodasSponsors } from '@/features/sponsors/actions/queries';
import { getAdminUsers } from '@/features/users/actions';
import CountryPaymentToggle from '@/features/geo/components/admin/CountryPaymentToggle';
import { getCountryConfig } from '@/features/geo/actions/queries';
import { PageHeader, Pill } from '@/shared/components/hireeo';
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
        const [usersData, servicesData, , metricas] = await Promise.all([
            getAdminUsers(1, 1),
            getAdminServices(1, 1),
            getTodasSponsors(1, 1),
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
            metricas: {
                totalGlobal: 0,
                porTipo: {},
                topServicios: [],
            },
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

type Props = { params: Promise<{ country: string }> };

export default async function AdminOverviewPage({ params }: Props) {
    const { country } = await params;
    const countryName = COUNTRY_SEO_CONFIG[country]?.countryName ?? country.toUpperCase();
    const [stats, recent, countryData] = await Promise.all([getDashboardStats(), getRecentInteractions(), getCountryConfig(country)]);

    const statsCards = [
        {
            label: 'Servicios Publicados',
            value: stats.servicios,
            icon: Hammer,
            color: 'text-brand',
            bg: 'bg-brand/10',
        },
        {
            label: 'Usuarios Registrados',
            value: stats.usuarios,
            icon: Users,
            color: 'text-green-600 dark:text-green-400',
            bg: 'bg-green-500/10',
        },
        {
            label: 'Total Interacciones',
            value: stats.metricas.totalGlobal.toLocaleString(),
            icon: Eye,
            color: 'text-indigo-600 dark:text-indigo-400',
            bg: 'bg-indigo-500/10',
        },
        {
            label: 'Sponsors Activos',
            value: stats.sponsorsActivos,
            icon: Megaphone,
            color: 'text-amber-600 dark:text-amber-400',
            bg: 'bg-amber-500/10',
        },
    ];

    return (
        <>
            <PageHeader
                breadcrumb={['Admin', 'Resumen']}
                title="Resumen general"
                subtitle="Estado de la plataforma, ingresos y actividad reciente."
                actions={
                    <Pill tone="accent" icon="globe">
                        {countryName}
                    </Pill>
                }
            />
            <div style={{ padding: 28 }}>
                <div className="animate-in fade-in space-y-8 duration-500">
                    
                    {/* Admin Actions */}
                    <div className="max-w-md">
                        <CountryPaymentToggle 
                            countryCode={country} 
                            initialStatus={countryData?.paymentsEnabled ?? true} 
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                        {statsCards.map((stat) => (
                            <div
                                key={stat.label}
                                className="rounded-[2rem] border border-line bg-bg p-6 shadow-sm transition-all hover:shadow-md dark:shadow-none"
                            >
                                <div
                                    className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${stat.bg} ${stat.color}`}
                                >
                                    <stat.icon size={24} />
                                </div>
                                <p className="text-xs font-black tracking-widest text-muted uppercase">
                                    {stat.label}
                                </p>
                                <h4 className="mt-1 text-2xl font-black text-ink">{stat.value}</h4>
                            </div>
                        ))}
                    </div>

                    <DashboardCharts
                        porTipo={stats.metricas.porTipo}
                        topServicios={stats.metricas.topServicios}
                    />

                    <RecentActivity interactions={recent.data} />
                </div>
            </div>
        </>
    );
}
