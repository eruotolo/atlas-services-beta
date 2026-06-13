import { getInteracciones, getInteraccionesMetricas } from '@/features/analytics/actions';
import DashboardCharts from '@/features/analytics/components/admin/DashboardCharts';
import RecentActivity from '@/features/analytics/components/admin/RecentActivity';
import { getAdminServices } from '@/features/services/actions/queries';
import { getTodasSponsors } from '@/features/sponsors/actions/queries';
import { getAdminUsers } from '@/features/users/actions';
import CountryPaymentToggle from '@/features/configuration/countries/components/CountryPaymentToggle/CountryPaymentToggle';
import { getCountryConfig } from '@/features/geo/actions/queries';
import { PageHeader, Pill, SectionLabel, Stat } from '@/shared/components/hireeo';
import type { HireIconName } from '@/shared/components/hireeo/icons';
import { formatCurrency } from '@/shared/lib/utils';
import { getDictionary } from '@/lib/i18n/getDictionary';
import { COUNTRY_SEO_CONFIG } from '@/features/geo/lib/countryUtils';

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

type Props = { params: Promise<{ country: string }> };

export default async function AdminOverviewPage({ params }: Props) {
    const { country } = await params;
    const countryName = COUNTRY_SEO_CONFIG[country]?.countryName ?? country.toUpperCase();
    const dictionary = await getDictionary(country);
    
    const [stats, recent, countryData] = await Promise.all([
        getDashboardStats(), 
        getRecentInteractions(), 
        getCountryConfig(country)
    ]);

    const dict = dictionary.admin.overview;

    const statsCards: Array<{ label: string; value: string; sub: string; icon: HireIconName }> = [
        {
            label: dict.statServices,
            value: stats.servicios.toLocaleString(),
            sub: countryName,
            icon: 'hammer',
        },
        {
            label: dict.statUsers,
            value: stats.usuarios.toLocaleString(),
            sub: countryName,
            icon: 'users',
        },
        {
            label: dict.statInteractions,
            value: stats.metricas.totalGlobal.toLocaleString(),
            sub: 'vistas y contactos',
            icon: 'eye',
        },
        {
            label: dict.statSponsors,
            value: stats.sponsorsActivos.toLocaleString(),
            sub: 'campañas activas',
            icon: 'bell',
        },
    ];

    return (
        <>
            <PageHeader
                breadcrumb={[dict.breadcrumb1, dict.breadcrumb2]}
                title={dict.title}
                subtitle={dict.subtitle}
                actions={
                    <div className="flex items-center gap-3">
                        <CountryPaymentToggle 
                            countryCode={country} 
                            initialStatus={countryData?.paymentsEnabled ?? true} 
                        />
                        <Pill tone="accent" icon="globe">
                            {countryName}
                        </Pill>
                    </div>
                }
            />
            <div className="w-full p-7">
                <div className="animate-in fade-in slide-in-from-bottom-4 flex flex-col gap-8 duration-700">
                    
                    {/* 1. Métricas (Top Row) */}
                    <section className="stagger-item">
                        <div className="mb-5">
                            <SectionLabel>{dict.breadcrumb2}</SectionLabel>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                </div>
            </div>
        </>
    );
}
