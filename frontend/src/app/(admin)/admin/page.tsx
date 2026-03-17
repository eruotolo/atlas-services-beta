import { CreditCard, Hammer, Megaphone, Users, } from 'lucide-react';

import { getAdminCategorias } from '@/features/categories/actions';
import { getAdminUsers } from '@/features/users/actions';
import { formatCurrency } from '@/shared/lib/utils';
import { getAuthToken } from '@/shared/lib/auth/getAuthToken';

async function getStats() {
    try {
        const token = await getAuthToken();
        if (!token) throw new Error('No token');
        
        // Use pagination endpoint meta to get totals without fetching all data
        const [usersData, _categoriesData] = await Promise.all([
            getAdminUsers(1, 1),
            getAdminCategorias(1, 1)
        ]);
        
        // Mock data for unimplemented endpoints
        return {
            servicios: 0, 
            usuarios: usersData?.meta?.total || 0,
            ingresosBrutos: formatCurrency(0),
            ingresosNetos: formatCurrency(0),
            sponsorsActivos: 0,
        };
    } catch(_e) {
        return {
            servicios: 0,
            usuarios: 0,
            ingresosBrutos: formatCurrency(0),
            ingresosNetos: formatCurrency(0),
            sponsorsActivos: 0,
        };
    }
}

async function getRecentActivity() {
    return []; // Mocked until API endpoints are available
}

export default async function AdminOverviewPage() {
    const stats = await getStats();
    const activities = await getRecentActivity();

    const statsCards = [
        {
            label: 'Servicios Totales',
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
            label: 'Ingresos Reales (Caja)',
            value: stats.ingresosNetos,
            subValue: `Cobrado: ${stats.ingresosBrutos}`,
            icon: CreditCard,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
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
                        {/* @ts-ignore */}
                        {stat.subValue && (
                            <p className="mt-1 text-xs font-bold text-gray-400 dark:text-gray-500">
                                {/* @ts-ignore */}
                                {stat.subValue}
                            </p>
                        )}
                    </div>
                ))}
            </div>

            <div className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-gray-900/40 dark:shadow-none dark:backdrop-blur-xl">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white">
                        Actividad Reciente
                    </h2>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                        Últimos movimientos
                    </span>
                </div>

                <div className="space-y-4">
                    {activities.length > 0 ? (
                        activities.map((item) => (
                            <div
                                /* @ts-expect-error */
                                key={item.id}
                                className="flex items-start gap-4 border-b border-gray-50 pb-4 last:border-0 last:pb-0 dark:border-white/5"
                            >
                                <div
                                    /* @ts-expect-error */
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.bg} ${item.color} dark:bg-opacity-20`}
                                >
                                    {/* @ts-ignore */}
                                    <item.icon size={20} />
                                </div>
                                <div className="flex-grow">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                                        {/* @ts-ignore */}
                                        {item.title}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {/* @ts-ignore */}
                                        {item.subtitle}
                                    </p>
                                </div>
                                <span className="text-[10px] font-medium whitespace-nowrap text-gray-400 dark:text-gray-600">
                                    {new Intl.DateTimeFormat('es-CL', {
                                        day: 'numeric',
                                        month: 'short',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    /* @ts-expect-error */
                                    }).format(item.date)}
                                </span>
                            </div>
                        ))
                    ) : (
                        <p className="py-8 text-center text-sm text-gray-500 italic dark:text-gray-600">
                            No hay actividad reciente registrada. (Panel Admin migrado temporalmente a mocks estáticos)
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
