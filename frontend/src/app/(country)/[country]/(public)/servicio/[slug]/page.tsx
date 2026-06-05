import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { checkIsFavorito } from '@/features/favorites/actions/queries';
import { COUNTRY_CONFIG, COUNTRY_SEO_CONFIG } from '@/features/geo/lib/countryUtils';
import {
    RelatedServices,
    ServiceAbout,
    ServiceBookingCard,
    ServiceGallery,
    ServiceHero,
    ServicePricingList,
    ServiceReviewsList,
    ServiceSubNav,
    ServiceTrustCard,
} from '@/features/services/components/detail';
import { getFilteredServices, getServicioBySlug } from '@/features/services/actions';

import { getDictionary } from '@/lib/i18n/getDictionary';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.hireeo.app';

type Props = {
    params: Promise<{ country: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { country, slug } = await params;
    const service = await getServicioBySlug(slug);

    if (!service) {
        return {
            title: 'Servicio no encontrado',
            description: 'El servicio que buscas no está disponible.',
        };
    }

    const title = `${service.userName} — ${service.category} en ${service.comuna}`;
    const description =
        service.description.length > 155
            ? `${service.description.substring(0, 152)}...`
            : service.description;

    const ogImage = service.imagenPrincipal || `${baseUrl}/hireeo-og.png`;

    return {
        title,
        description,
        keywords: [
            service.category,
            service.comuna,
            service.title,
            'servicios profesionales',
            'Hireeo',
        ],
        openGraph: {
            title,
            description,
            type: 'website',
            url: `${baseUrl}/${country}/servicio/${service.slug}`,
            images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
            siteName: 'Hireeo',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [ogImage],
        },
        alternates: {
            canonical: `/${country}/servicio/${service.slug}`,
        },
    };
}

function generateLocalBusinessSchema(
    service: NonNullable<Awaited<ReturnType<typeof getServicioBySlug>>>,
    countryName: string,
    countryCode: string,
    professionalName: string,
    contactEmail: string | null,
    contactPhone: string | null,
) {
    return {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        '@id': `${baseUrl}/${countryCode}/servicio/${service.slug}#business`,
        name: professionalName,
        image: service.userAvatar || service.imagenPrincipal || `${baseUrl}/hireeo-og.png`,
        telephone: contactPhone ?? undefined,
        email: contactEmail ?? undefined,
        address: {
            '@type': 'PostalAddress',
            addressLocality: service.comuna,
            addressCountry: countryCode.toUpperCase(),
        },
        priceRange: service.price > 0 ? `${service.price}` : 'Cotización',
        ...(service.reviewsCount > 0 && {
            aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: service.rating,
                reviewCount: service.reviewsCount,
                bestRating: 5,
                worstRating: 1,
            },
        }),
        ...(countryName ? { areaServed: { '@type': 'Country', name: countryName } } : {}),
    };
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: composición de la pantalla detail con múltiples bloques
export default async function ServiceDetailPage({ params }: Props) {
    const { country, slug } = await params;
    const service = await getServicioBySlug(slug);

    if (!service) {
        notFound();
    }

    const dict = getDictionary(country);
    const countryConfig = COUNTRY_CONFIG[country] ?? COUNTRY_CONFIG.cl;
    const countryName = COUNTRY_SEO_CONFIG[country]?.countryName ?? country.toUpperCase();

    const session = await getServerSession(authOptions);
    const sessionUser = session?.user as
        | { id?: string; name?: string | null }
        | undefined;
    const currentUserId = sessionUser?.id;
    const currentUserName = sessionUser?.name ?? null;
    const isOwner = Boolean(currentUserId) && currentUserId === service.userId;
    const isFavorite = currentUserId ? await checkIsFavorito(service.id) : false;

    const professionalName = service.nombreContacto || service.userName;
    const contactEmail = service.emailContacto || service.userEmail;
    const contactPhone = service.telefonoContacto || service.userPhone;

    const relatedResponse = await getFilteredServices({
        category: service.category,
        countryCode: country,
        page: 1,
        limit: 5,
    });

    const relatedServices = relatedResponse.services
        .filter((s) => s.id !== service.id)
        .slice(0, 4);

    const bookingStats: Array<{ value: string; label: string }> = service.reviewsCount > 0
        ? [
              { value: '—', label: dict.serviceDetail.statRespondsIn },
              {
                  value: `${service.reviewsCount}`,
                  label: dict.serviceDetail.statCompletion,
              },
              { value: '—', label: dict.serviceDetail.statExperience },
          ]
        : [];

    const localBusinessSchema = generateLocalBusinessSchema(
        service,
        countryName,
        country,
        professionalName,
        contactEmail,
        contactPhone,
    );

    return (
        <>
            <script
                // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requerido por SEO
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(localBusinessSchema).replace(/</g, '<'),
                }}
                type="application/ld+json"
            />

            <ServiceSubNav
                dict={dict}
                country={country}
                countryName={countryName}
                regionName={null}
                localityName={service.comuna || null}
                category={service.category}
                professionalName={professionalName}
                serviceId={service.id}
                serviceSlug={service.slug}
                serviceTitle={service.title}
                serviceDescription={service.description}
                initialIsFavorite={isFavorite}
            />

            <section className="mx-auto max-w-site px-6 py-10 sm:px-10 lg:px-14">
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.5fr_minmax(0,1fr)]">
                    <div className="min-w-0">
                        <ServiceHero
                            dict={dict}
                            service={service}
                            professionalName={professionalName}
                        />

                        <ServiceGallery
                            dict={dict}
                            mainImage={service.imagenPrincipal}
                            images={service.imagenes}
                            title={service.title}
                        />

                        <div className="space-y-8">
                            <ServiceAbout
                                dict={dict}
                                professionalName={professionalName}
                                description={service.description}
                            />
                            <ServicePricingList
                                dict={dict}
                                title={service.title}
                                price={service.price}
                                currencySymbol={countryConfig.currencySymbol}
                                locale={countryConfig.locale}
                            />
                            <ServiceReviewsList
                                dict={dict}
                                serviceId={service.id}
                                serviceSlug={service.slug}
                                serviceTitle={service.title}
                                servicePrice={service.price}
                                country={country}
                                professionalName={professionalName}
                                currentUserName={currentUserName}
                                rating={service.rating}
                                reviewsCount={service.reviewsCount}
                                reviews={service.resenas}
                                isOwner={isOwner}
                                isLoggedIn={Boolean(currentUserId)}
                                locale={countryConfig.locale}
                                currencySymbol={countryConfig.currencySymbol}
                            />
                        </div>
                    </div>

                    <aside>
                        <div className="sticky top-20">
                            <ServiceBookingCard
                                dict={dict}
                                serviceId={service.id}
                                serviceTitle={service.title}
                                price={service.price}
                                currencySymbol={countryConfig.currencySymbol}
                                locale={countryConfig.locale}
                                isOwner={isOwner}
                                contactPhone={contactPhone}
                                stats={bookingStats}
                            />
                            <ServiceTrustCard dict={dict} />
                        </div>
                    </aside>
                </div>
            </section>

            <RelatedServices
                dict={dict}
                country={country}
                category={service.category}
                services={relatedServices}
                currencySymbol={countryConfig.currencySymbol}
                locale={countryConfig.locale}
            />
        </>
    );
}
