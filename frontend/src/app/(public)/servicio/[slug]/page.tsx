import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Award, Edit3, Heart, MapPin, ShieldCheck, Star } from 'lucide-react';
import type { Metadata } from 'next';

import { getServicioBySlug } from '@/features/services/actions';

import ShareButton from '@/shared/components/ui/ShareButton';

import ContactButtons from './ContactButtons';
import ImageGallery from './ImageGallery';
import ProviderContactInfo from './ProviderContactInfo';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.atlasservicios.com';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
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

    const ogImage = service.imagenPrincipal || `${baseUrl}/bg-chiloe-01.png`; // TODO: rename to atlas-og.png

    return {
        title,
        description,
        keywords: [
            service.category,
            service.comuna,
            service.title,
            `${service.category} en ${service.comuna}`,
            'servicios profesionales',
            'Atlas Services',
            'profesionales verificados',
        ],
        openGraph: {
            title,
            description,
            type: 'website',
            url: `${baseUrl}/servicio/${service.slug}`,
            images: [
                {
                    url: ogImage,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
            locale: 'es_CL',
            siteName: 'Atlas Services',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [ogImage],
        },
        alternates: {
            canonical: `/servicio/${service.slug}`,
        },
    };
}

type ServiceDetail = NonNullable<Awaited<ReturnType<typeof getServicioBySlug>>>;

// Helper functions for JSON-LD Schemas
function generateLocalBusinessSchema(service: ServiceDetail, baseUrl: string) {
    return {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        '@id': `${baseUrl}/servicio/${service.slug}#business`,
        name: service.userName,
        image: service.userAvatar || service.imagenPrincipal || `${baseUrl}/bg-chiloe-01.png`,
        telephone: service.userPhone,
        email: service.userEmail,
        address: {
            '@type': 'PostalAddress',
            addressLocality: service.comuna,
            addressRegion: 'Los Lagos',
            addressCountry: 'CL',
        },
        geo: {
            '@type': 'GeoCoordinates',
            addressCountry: 'CL',
        },
        priceRange: service.price > 0 ? `$${service.price}` : 'Cotización',
        ...(service.reviewsCount > 0 && {
            aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: service.rating,
                reviewCount: service.reviewsCount,
                bestRating: 5,
                worstRating: 1,
            },
        }),
    };
}

function generateServiceSchema(service: ServiceDetail, baseUrl: string) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Service',
        '@id': `${baseUrl}/servicio/${service.slug}#service`,
        serviceType: service.category,
        name: service.title,
        description: service.description,
        provider: {
            '@id': `${baseUrl}/servicio/${service.slug}#business`,
        },
        areaServed: {
            '@type': 'City',
            name: service.comuna,
        },
        ...(service.price > 0 && {
            offers: {
                '@type': 'Offer',
                price: service.price,
                priceCurrency: 'CLP',
            },
        }),
        image: service.imagenPrincipal || `${baseUrl}/bg-chiloe-01.png`,
        url: `${baseUrl}/servicio/${service.slug}`,
    };
}

function generateBreadcrumbSchema(service: ServiceDetail, baseUrl: string) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Inicio',
                item: baseUrl,
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Servicios',
                item: `${baseUrl}/buscar`,
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: service.category,
                item: `${baseUrl}/buscar?c=${encodeURIComponent(service.category)}`,
            },
            {
                '@type': 'ListItem',
                position: 4,
                name: service.title,
                item: `${baseUrl}/servicio/${service.slug}`,
            },
        ],
    };
}

function generateReviewsSchema(service: ServiceDetail, baseUrl: string) {
    if (service.reviewsCount === 0) return [];
    return service.resenas.map((review) => ({
        '@context': 'https://schema.org',
        '@type': 'Review',
        itemReviewed: {
            '@id': `${baseUrl}/servicio/${service.slug}#service`,
        },
        author: {
            '@type': 'Person',
            name: review.userName,
        },
        reviewRating: {
            '@type': 'Rating',
            ratingValue: review.rating,
            bestRating: 5,
            worstRating: 1,
        },
        reviewBody: review.comment,
        datePublished: new Date(review.date).toISOString(),
    }));
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const service = await getServicioBySlug(slug);

    if (!service) {
        notFound();
    }

    // Lógica de fallback: usar datos del servicio, si están vacíos usar datos del usuario
    const contactName = service.nombreContacto || service.userName;
    const contactEmail = service.emailContacto || service.userEmail;
    const contactPhone = service.telefonoContacto || service.userPhone;

    // Crear objeto de servicio con datos de contacto correctos para schemas
    const serviceWithContact = {
        ...service,
        userName: contactName,
        userEmail: contactEmail,
        userPhone: contactPhone,
    };

    // JSON-LD Schemas
    const localBusinessSchema = generateLocalBusinessSchema(serviceWithContact, baseUrl);
    const serviceSchema = generateServiceSchema(serviceWithContact, baseUrl);
    const breadcrumbSchema = generateBreadcrumbSchema(serviceWithContact, baseUrl);
    const reviewsSchema = generateReviewsSchema(serviceWithContact, baseUrl);

    return (
        <>
            {/* Structured Data: LocalBusiness */}
            <script
                // biome-ignore lint/security/noDangerouslySetInnerHtml: Requerido para JSON-LD schema SEO
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(localBusinessSchema).replace(/</g, '\u003c'),
                }}
                type="application/ld+json"
            />
            {/* Structured Data: Service */}
            <script
                // biome-ignore lint/security/noDangerouslySetInnerHtml: Requerido para JSON-LD schema SEO
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(serviceSchema).replace(/</g, '\u003c'),
                }}
                type="application/ld+json"
            />
            {/* Structured Data: Breadcrumbs */}
            <script
                // biome-ignore lint/security/noDangerouslySetInnerHtml: Requerido para JSON-LD schema SEO
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(breadcrumbSchema).replace(/</g, '\u003c'),
                }}
                type="application/ld+json"
            />
            {/* Structured Data: Reviews */}
            {reviewsSchema.length > 0 &&
                reviewsSchema.map((review) => (
                    <script
                        key={review.datePublished}
                        // biome-ignore lint/security/noDangerouslySetInnerHtml: Requerido para JSON-LD schema SEO
                        dangerouslySetInnerHTML={{
                            __html: JSON.stringify(review).replace(/</g, '\u003c'),
                        }}
                        type="application/ld+json"
                    />
                ))}
            <section className="bg-background min-h-screen py-6 md:py-10">
                <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumbs */}
                    <nav className="mb-6 flex flex-wrap items-center gap-2 text-[10px] font-bold tracking-widest text-gray-400 uppercase md:mb-8 md:text-xs dark:text-gray-500">
                        <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">
                            Inicio
                        </Link>
                        <span>/</span>
                        <Link
                            href="/buscar"
                            className="hover:text-blue-600 dark:hover:text-blue-400"
                        >
                            Servicios
                        </Link>
                        <span>/</span>
                        <span className="max-w-[150px] truncate text-gray-600 md:max-w-none dark:text-gray-300">
                            {service.category}
                        </span>
                    </nav>

                    <div className="grid grid-cols-1 gap-8 md:gap-12 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="space-y-6 md:space-y-8 lg:col-span-2">
                            {/* Image Gallery */}
                            <ImageGallery
                                imagenPrincipal={service.imagenPrincipal}
                                imagenes={service.imagenes}
                                title={service.title}
                                isPremium={service.isPremium}
                            />

                            <div>
                                <div className="mb-4 flex flex-wrap items-center gap-3 md:gap-4">
                                    {service.categories && service.categories.length > 0 ? (
                                        service.categories.map((cat) => (
                                            <span
                                                key={cat.id}
                                                className="rounded bg-blue-100 px-2 py-1 text-[9px] font-bold tracking-wider text-blue-700 uppercase md:text-[10px] dark:bg-blue-900/30 dark:text-blue-400"
                                            >
                                                {cat.nombre}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="rounded bg-blue-100 px-2 py-1 text-[9px] font-bold tracking-wider text-blue-700 uppercase md:text-[10px] dark:bg-blue-900/30 dark:text-blue-400">
                                            {service.category}
                                        </span>
                                    )}
                                    <div className="flex items-center gap-1.5">
                                        <div className="flex items-center gap-0.5 text-yellow-500">
                                            {Array.from({ length: 5 }).map((_, i) => {
                                                return (
                                                    <Star
                                                        // biome-ignore lint/suspicious/noArrayIndexKey: Array estático de estrellas
                                                        key={i}
                                                        size={14}
                                                        fill={
                                                            i < Math.round(service.rating)
                                                                ? 'currentColor'
                                                                : 'none'
                                                        }
                                                        className={
                                                            i < Math.round(service.rating)
                                                                ? ''
                                                                : 'text-gray-300 dark:text-gray-700'
                                                        }
                                                    />
                                                );
                                            })}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-xs font-bold text-gray-900 md:text-sm dark:text-white">
                                                {service.reviewsCount > 0
                                                    ? Number.isInteger(service.rating)
                                                        ? service.rating
                                                        : service.rating.toFixed(1)
                                                    : '0'}
                                            </span>
                                            <span className="text-[10px] text-gray-400 md:text-sm dark:text-gray-500">
                                                ({service.reviewsCount} reseñas)
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-gray-500 md:text-sm dark:text-gray-400">
                                        <MapPin size={14} className="text-blue-500 md:h-4 md:w-4" />
                                        <span>{service.comuna}</span>
                                    </div>
                                </div>

                                <h1 className="mb-4 text-2xl leading-tight font-black text-gray-900 capitalize md:mb-6 md:text-4xl dark:text-white">
                                    {service.title}
                                </h1>

                                <div className="prose prose-blue max-w-none text-base leading-relaxed text-gray-600 md:text-lg dark:text-gray-300">
                                    <p className="whitespace-pre-wrap">{service.description}</p>
                                </div>
                            </div>

                            {/* Provider Info */}
                            <ProviderContactInfo
                                servicioId={service.id}
                                userName={contactName}
                                userAvatar={service.userAvatar}
                                userPhone={contactPhone}
                                userEmail={contactEmail}
                                redesSociales={service.redesSociales}
                            />

                            {/* Mock Reviews Section */}
                            <div className="border-t border-gray-100 pt-8 md:pt-10 dark:border-white/5">
                                <div className="mb-6 flex items-center justify-between md:mb-8">
                                    <h3 className="text-xl font-bold text-gray-900 md:text-2xl dark:text-white">
                                        Reseñas de Clientes
                                    </h3>
                                    <Link
                                        href={`/servicio/${service.slug}/resena`}
                                        className="flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-[10px] font-bold text-blue-600 transition-colors hover:bg-blue-100 md:px-4 md:text-xs dark:border dark:border-blue-500/20 dark:bg-blue-600/20 dark:text-blue-400 dark:hover:border-blue-500/40 dark:hover:bg-blue-600/30"
                                    >
                                        <Edit3 size={12} className="md:h-3.5 md:w-3.5" /> Dejar una
                                        reseña
                                    </Link>
                                </div>

                                {service.reviewsCount === 0 ? (
                                    <div className="rounded-2xl bg-gray-50 p-6 text-center md:p-8 dark:border dark:border-white/5 dark:bg-gray-900/40">
                                        <p className="text-sm text-gray-500 md:text-base dark:text-gray-400">
                                            Aún no hay reseñas para este servicio.
                                        </p>
                                        <p className="mt-1 text-xs text-gray-400 md:text-sm dark:text-gray-500">
                                            ¡Sé el primero en dejar una reseña!
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4 md:space-y-6">
                                        {service.resenas.map((review) => (
                                            <div
                                                key={review.id}
                                                className="rounded-2xl bg-gray-50 p-5 md:p-6 dark:border dark:border-white/5 dark:bg-gray-900/40"
                                            >
                                                <div className="mb-3 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600 md:h-10 md:w-10 md:text-base dark:bg-blue-900/30 dark:text-blue-400">
                                                            {review.userName
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-gray-900 md:text-sm dark:text-white">
                                                                {review.userName}
                                                            </p>
                                                            <p className="text-[10px] text-gray-400 dark:text-gray-500">
                                                                {new Date(
                                                                    review.date,
                                                                ).toLocaleDateString('es-CL', {
                                                                    day: 'numeric',
                                                                    month: 'long',
                                                                    year: 'numeric',
                                                                })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-0.5 text-yellow-500">
                                                        {Array.from({ length: 5 }).map((_, j) => {
                                                            return (
                                                                <Star
                                                                    // biome-ignore lint/suspicious/noArrayIndexKey: Array estático de estrellas
                                                                    key={j}
                                                                    size={12}
                                                                    fill={
                                                                        j < review.rating
                                                                            ? 'currentColor'
                                                                            : 'none'
                                                                    }
                                                                    className={
                                                                        j < review.rating
                                                                            ? ''
                                                                            : 'text-gray-300 dark:text-gray-700'
                                                                    }
                                                                />
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-600 italic md:text-base dark:text-gray-300">
                                                    &quot;{review.comment}&quot;
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sticky Sidebar */}
                        <aside className="space-y-6">
                            <div className="sticky top-24 rounded-[2rem] border border-gray-100 bg-white p-6 shadow-xl shadow-blue-900/5 md:rounded-3xl md:p-8 dark:border-white/10 dark:bg-gray-900/40 dark:shadow-none dark:backdrop-blur-xl">
                                <div className="mb-6">
                                    {service.price > 0 ? (
                                        <>
                                            <p className="mb-1 text-xs font-bold tracking-widest text-gray-400 uppercase md:text-sm dark:text-gray-500">
                                                Precio Referencial
                                            </p>
                                            <h4 className="text-3xl font-extrabold text-blue-600 md:text-4xl dark:text-blue-400">
                                                ${service.price.toLocaleString('es-CL')}
                                            </h4>
                                        </>
                                    ) : (
                                        <h4 className="text-2xl font-extrabold text-blue-600 md:text-3xl dark:text-blue-400">
                                            Solicitar Cotización
                                        </h4>
                                    )}
                                </div>

                                <ContactButtons servicioId={service.id} userPhone={contactPhone} />

                                <div className="space-y-4 border-t border-gray-50 pt-6 dark:border-white/5">
                                    <div className="flex items-center gap-3 text-xs font-medium text-gray-500 md:text-sm dark:text-gray-400">
                                        <ShieldCheck
                                            size={16}
                                            className="text-blue-500 md:h-[18px] md:w-[18px]"
                                        />
                                        <span>Identidad Verificada</span>
                                    </div>
                                    {service.isPremium && (
                                        <div className="flex items-center gap-3 text-xs font-medium text-gray-500 md:text-sm dark:text-gray-400">
                                            <Award
                                                size={16}
                                                className="text-yellow-500 md:h-[18px] md:w-[18px]"
                                            />
                                            <span>Proveedor Destacado</span>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-8 flex justify-center gap-4">
                                    <Link
                                        href={`/servicio/${service.slug}/resena`}
                                        className="rounded-full border border-gray-100 p-2.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 md:p-3 dark:border-red-500/20 dark:bg-red-500/5 dark:text-red-400 dark:hover:bg-red-500/20 dark:hover:text-red-300"
                                        title="Dejar Reseña"
                                    >
                                        <Heart size={16} className="md:h-[18px] md:w-[18px]" />
                                    </Link>
                                    <ShareButton
                                        title={service.title}
                                        text={service.description}
                                        url={`/servicio/${service.slug}`}
                                    />
                                </div>
                            </div>

                            {/* Sidebar Ad Banner */}
                            <div className="rounded-[2rem] border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 text-center md:rounded-3xl dark:border-blue-900/30 dark:from-blue-900/20 dark:to-indigo-900/20">
                                <h5 className="mb-2 text-sm font-bold text-blue-900 md:text-base dark:text-blue-200">
                                    Garantía Atlas
                                </h5>
                                <p className="text-[10px] leading-relaxed text-blue-700 md:text-xs dark:text-blue-400">
                                    Contrata tranquilo. Si el trabajo no es lo que esperabas,
                                    nosotros te apoyamos con la mediación.
                                </p>
                                <button
                                    type="button"
                                    className="mt-4 text-[10px] font-bold text-blue-600 hover:underline md:text-xs dark:text-blue-400"
                                >
                                    Saber más sobre garantías
                                </button>
                            </div>
                        </aside>
                    </div>
                </div>
            </section>
        </>
    );
}
