import type { MetadataRoute } from 'next';

import { getAllPublicServices } from '@/features/services/actions';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.hireeo.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Rutas estáticas principales
    const routes = [
        '',
        '/search',
        '/login',
        '/register',
        '/publish',
        '/how-it-works',
        '/help',
        '/contact',
        '/pricing',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // Generar rutas dinámicas para TODOS los servicios públicos activos
    const services = await getAllPublicServices();

    const serviceRoutes = services.map((service) => ({
        url: `${baseUrl}/service/${service.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: service.isPremium ? 0.9 : 0.7,
    }));

    return [...routes, ...serviceRoutes];
}
