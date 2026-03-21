import type { Metadata } from 'next';

import { getServicioBySlug } from '@/features/services/actions';

import ServiceDetailPageContent from '@/app/(public)/servicio/[slug]/page';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://atlasservicios.cl';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ country: string; slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const service = await getServicioBySlug(slug);

    if (!service) {
        return {
            title: 'Servicio no encontrado',
            description: 'El servicio que buscas no está disponible.',
        };
    }

    const title = `${service.title} - ${service.category} en ${service.comuna}`;
    const description =
        service.description.length > 155
            ? `${service.description.substring(0, 152)}...`
            : service.description;

    const ogImage = service.imagenPrincipal || `${baseUrl}/bg-chiloe-01.png`;

    return {
        title,
        description,
        keywords: [service.category, service.comuna, service.title, 'servicios profesionales'],
        openGraph: {
            title,
            description,
            type: 'website',
            url: `${baseUrl}/servicio/${service.slug}`,
            images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
        },
    };
}

export default ServiceDetailPageContent;
