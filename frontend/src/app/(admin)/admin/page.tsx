import { BarChart3, CreditCard, Eye, Hammer, Megaphone, Users } from 'lucide-react';

import { getInteracciones, getInteraccionesMetricas } from '@/features/analytics/actions';
import DashboardCharts from '@/features/analytics/components/admin/DashboardCharts';
import RecentActivity from '@/features/analytics/components/admin/RecentActivity';
import { getAdminCategorias } from '@/features/categories/actions';
import { getAdminServices } from '@/features/services/actions/queries';
import { getTodasSponsors } from '@/features/sponsors/actions/queries';
import { getAdminUsers } from '@/features/users/actions';
import { formatCurrency } from '@/shared/lib/utils';

/* ------------------------------------------------------------------ */
/*  Data fetching                                                      */
/* ------------------------------------------------------------------ */

async function getDashboardStats() {
    try {
        const [usersData, servicesData, sponsorsData, metricas] = await Promise.all([
            getAdminUsers(1, 1),
            getAdminServices(1, 1),
            getTodasSponsors(1, 1),
            getInteraccionesMetricas(),
        ]);

        // Count active sponsors — fetch up to 100 to check
        const sponsorsAll = await getTodasSponsors(1, 100);
        const sponsorsActivos = sponsorsAll.data.filter((s) => s.activo).length;

        return {
            servicios: servicesData?.meta?.total ?? 0,
            usuarios: usersData?.meta?.total ?? 0,
            ingresosBrutos: formatCurrency(0), // Will be real once Stripe is integrated (F1.2)
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
                porTipo: {} as Record<string, number>,
                topServicios: [] as Array<{ servicioId: string; titulo: string; total: number }>,
            },
        };
    }
}

async function getRecentInteractions() {
    try {
        const result = await getInteracciones(1, 8);
        return result;
    } catch {
        return { data: [], meta: { total: 0, page: 1, limit: 8, totalPages: 0 } };
    }
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default async function AdminOverviewPage() {
    const [stats, recent] = await Promise.all([getDashboardStats(), getRecentInteractions()]);

    const statsCards = [
        {
            label: 'Servicios Publicados',
            value: stats.servicios,
            icon: Hammer,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
        },
        {
            label: 'Usuarios Registrados',
            value: stats.usuarios,
            icon: Users,
            color: 'text-green-600',
            bg: 'bg-green-50',
        },
        {
            label: 'Total Interacciones',
            value: stats.metricas.totalGlobal.toLocaleString(),
            icon: Eye,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
        },
        {
            label: 'Sponsors Activos',
            value: stats.sponsorsActivos,
            icon: Megaphone,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
        },
    ];

    return (
        <div className="animate-in fade-in space-y-8 transition-colors duration-300 duration-500">
            {/* Stats cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                {statsCards.map((stat) => (
                    <div
                        key={stat.label}
                        className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-white/10 dark:bg-gray-900/40 dark:shadow-none"
                    >
                        <div
                            className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${stat.bg} ${stat.color} dark:bg-opacity-20`}
                        >
                            <stat.icon size={24} />
                        </div>
                        <p className="text-xs font-black tracking-widest text-gray-400 uppercase dark:text-gray-500">
                            {stat.label}
                        </p>
                        <h4 className="mt-1 text-2xl font-black text-gray-900 dark:text-white">
                            {stat.value}
                        </h4>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <DashboardCharts
                porTipo={stats.metricas.porTipo}
                topServicios={stats.metricas.topServicios}
            />

            {/* Recent Activity */}
            <RecentActivity interactions={recent.data} />
        </div>
    );
}
