'use client';

import { usePathname } from 'next/navigation';
import type { ReactElement, ReactNode } from 'react';

import { PageHeader } from '@/shared/components/hireeo';

interface RouteConfig {
    breadcrumb: string[];
    title: string;
    subtitle?: string;
}

const ROUTE_MAP: Record<string, RouteConfig> = {
    '/config': {
        breadcrumb: ['Config', 'Resumen'],
        title: 'Resumen global',
        subtitle: 'Estado de la plataforma en todos los países.',
    },
    '/config/services': {
        breadcrumb: ['Config', 'Operación'],
        title: 'Servicios',
        subtitle: 'Gestión de servicios publicados en la plataforma.',
    },
    '/config/users': {
        breadcrumb: ['Config', 'Operación'],
        title: 'Usuarios',
        subtitle: 'Gestión de usuarios registrados.',
    },
    '/config/ratings': {
        breadcrumb: ['Config', 'Operación'],
        title: 'Calificaciones',
        subtitle: 'Moderación de reseñas y calificaciones.',
    },
    '/config/interactions': {
        breadcrumb: ['Config', 'Operación'],
        title: 'Interacciones',
        subtitle: 'Métricas y estadísticas de interacción.',
    },
    '/config/categories': {
        breadcrumb: ['Config', 'Catálogo'],
        title: 'Categorías',
        subtitle: 'Gestión del catálogo de categorías.',
    },
    '/config/sponsors': {
        breadcrumb: ['Config', 'Catálogo'],
        title: 'Sponsors',
        subtitle: 'Gestión de publicidad y sponsors.',
    },
    '/config/premium-prices': {
        breadcrumb: ['Config', 'Pagos'],
        title: 'Precios Premium',
        subtitle: 'Configuración de planes y precios premium.',
    },
    '/config/payments': {
        breadcrumb: ['Config', 'Pagos'],
        title: 'Pagos',
        subtitle: 'Historial de transacciones y pagos.',
    },
    '/config/countries': {
        breadcrumb: ['Config', 'Plataforma'],
        title: 'Países',
        subtitle: 'Gestión de países activos en la plataforma.',
    },
};

const DEFAULT_CONFIG: RouteConfig = {
    breadcrumb: ['Config'],
    title: 'Panel de Control',
};

interface ConfigPageHeaderProps {
    actions?: ReactNode;
}

export function ConfigPageHeader({ actions }: ConfigPageHeaderProps): ReactElement {
    const pathname = usePathname();
    const config = ROUTE_MAP[pathname] ?? DEFAULT_CONFIG;

    return (
        <PageHeader
            breadcrumb={config.breadcrumb}
            title={config.title}
            subtitle={config.subtitle}
            actions={actions}
        />
    );
}
