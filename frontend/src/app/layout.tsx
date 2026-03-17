import { Inter } from 'next/font/google';

import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';

import Footer from '@/shared/components/layout/Footer';
import Navbar from '@/shared/components/layout/Navbar';
import { SubscriptionLevel } from '@/shared/types/common';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Providers } from '@/lib/providers/Providers';

import './globals.css';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    weight: ['300', '400', '500', '600', '700'],
    display: 'swap',
});

// Configuración global del sitio
const siteConfig = {
    name: 'Chiloé Servicios',
    description:
        'Encuentra los mejores profesionales en Chiloé. Gasfitería, electricidad, carpintería, fletes y más en Castro, Ancud, Quellón y toda la isla.',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://www.chiloeservicios.cl',
    ogImage: '/bg-chiloe-01.png', // Usamos la imagen local como default
    links: {
        twitter: 'https://twitter.com/chiloeservicios',
        github: 'https://github.com/chiloeservicios',
    },
};

export const metadata: Metadata = {
    metadataBase: new URL(siteConfig.url),
    title: {
        default: siteConfig.name,
        template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    // Meta adicional para AI Search y LLM comprehension
    other: {
        'geo.region': 'CL-LL',
        'geo.placename': 'Chiloé',
        'geo.position': '-42.5;-73.8',
        ICBM: '-42.5, -73.8',
        'DC.title': 'Chiloé Servicios - Directorio de Profesionales en Chiloé',
        'DC.description':
            'Plataforma hiperlocal que conecta usuarios con proveedores de servicios profesionales en la Isla de Chiloé. Gasfíter, electricista, carpintero, fletes y más.',
        'DC.subject':
            'Directorio servicios, Profesionales Chiloé, Servicios hogar, Oficios manuales',
        'DC.coverage': 'Chiloé, Chile',
        'DC.language': 'es-CL',
    },
    keywords: [
        // Marca y Base
        'Chiloé Servicios',
        'Directorio de servicios Chiloé',
        'Isla de Chiloé',
        'Región de Los Lagos',
        'Servicios hogar Chiloé',
        'Datos de maestros Chiloé',
        'Profesionales en Chiloé',

        // Categorías y Oficios - Hogar y Construcción
        'Gasfitería / Fontanería',
        'Gasfitería / Fontanería a domicilio',
        'Gasfitería / Fontanería en Chiloé',
        'Gasfitería / Fontanería profesional',
        'Gasfitería / Fontanería en Castro',
        'Gasfitería / Fontanería Castro',
        'Gasfitería / Fontanería en Ancud',
        'Gasfitería / Fontanería Ancud',
        'Gasfitería / Fontanería en Quellón',
        'Gasfitería / Fontanería Quellón',
        'Electricidad e Iluminación',
        'Electricidad e Iluminación a domicilio',
        'Electricidad e Iluminación en Chiloé',
        'Electricidad e Iluminación profesional',
        'Electricidad e Iluminación en Castro',
        'Electricidad e Iluminación Castro',
        'Electricidad e Iluminación en Ancud',
        'Electricidad e Iluminación Ancud',
        'Electricidad e Iluminación en Quellón',
        'Electricidad e Iluminación Quellón',
        'Cerrajería',
        'Cerrajería a domicilio',
        'Cerrajería en Chiloé',
        'Cerrajería profesional',
        'Cerrajería en Castro',
        'Cerrajería Castro',
        'Cerrajería en Ancud',
        'Cerrajería Ancud',
        'Cerrajería en Quellón',
        'Cerrajería Quellón',
        'Carpintería y Mueblista',
        'Carpintería y Mueblista a domicilio',
        'Carpintería y Mueblista en Chiloé',
        'Carpintería y Mueblista profesional',
        'Carpintería y Mueblista en Castro',
        'Carpintería y Mueblista Castro',
        'Carpintería y Mueblista en Ancud',
        'Carpintería y Mueblista Ancud',
        'Carpintería y Mueblista en Quellón',
        'Carpintería y Mueblista Quellón',
        'Pintura y Papel Mural',
        'Pintura y Papel Mural a domicilio',
        'Pintura y Papel Mural en Chiloé',
        'Pintura y Papel Mural profesional',
        'Albañilería y Pisos',
        'Albañilería y Pisos a domicilio',
        'Albañilería y Pisos en Chiloé',
        'Albañilería y Pisos profesional',
        'Vidriería y Aluminio',
        'Vidriería y Aluminio a domicilio',
        'Vidriería y Aluminio en Chiloé',
        'Vidriería y Aluminio profesional',
        'Reparación de Techos y Goteras',
        'Reparación de Techos y Goteras a domicilio',
        'Reparación de Techos y Goteras en Chiloé',
        'Reparación de Techos y Goteras profesional',
        'Limpieza de Fachadas y Canaletas',
        'Limpieza de Fachadas y Canaletas a domicilio',
        'Limpieza de Fachadas y Canaletas en Chiloé',
        'Limpieza de Fachadas y Canaletas profesional',
        'Destape de Desagües',
        'Destape de Desagües a domicilio',
        'Destape de Desagües en Chiloé',
        'Destape de Desagües profesional',
        'Climatización',
        'Climatización a domicilio',
        'Climatización en Chiloé',
        'Climatización profesional',
        'Reparación de Electrodomésticos',
        'Reparación de Electrodomésticos a domicilio',
        'Reparación de Electrodomésticos en Chiloé',
        'Reparación de Electrodomésticos profesional',

        // Limpieza y Mantención
        'Limpieza de Hogar',
        'Limpieza de Hogar a domicilio',
        'Limpieza de Hogar en Chiloé',
        'Limpieza de Hogar profesional',
        'Limpieza de Tapices y Alfombras',
        'Limpieza de Tapices y Alfombras a domicilio',
        'Limpieza de Tapices y Alfombras en Chiloé',
        'Limpieza de Tapices y Alfombras profesional',
        'Fumigación y Control de Plagas',
        'Fumigación y Control de Plagas a domicilio',
        'Fumigación y Control de Plagas en Chiloé',
        'Fumigación y Control de Plagas profesional',

        // Jardinería y Exterior
        'Jardinería y Paisajismo',
        'Jardinería y Paisajismo a domicilio',
        'Jardinería y Paisajismo en Chiloé',
        'Jardinería y Paisajismo profesional',
        'Poda y Corte de Árboles',
        'Poda y Corte de Árboles a domicilio',
        'Poda y Corte de Árboles en Chiloé',
        'Poda y Corte de Árboles profesional',
        'Mantención de Piscinas',
        'Mantención de Piscinas a domicilio',
        'Mantención de Piscinas en Chiloé',
        'Mantención de Piscinas profesional',
        'Riego Automático',
        'Riego Automático a domicilio',
        'Riego Automático en Chiloé',
        'Riego Automático profesional',

        // Belleza y Estética
        'Peluquería y Barbería',
        'Peluquería y Barbería a domicilio',
        'Peluquería y Barbería en Chiloé',
        'Peluquería y Barbería profesional',
        'Manicure y Pedicure',
        'Manicure y Pedicure a domicilio',
        'Manicure y Pedicure en Chiloé',
        'Manicure y Pedicure profesional',
        'Maquillaje y Peinado',
        'Maquillaje y Peinado a domicilio',
        'Maquillaje y Peinado en Chiloé',
        'Maquillaje y Peinado profesional',
        'Depilación',
        'Depilación a domicilio',
        'Depilación en Chiloé',
        'Depilación profesional',
        'Tratamientos Faciales y Corporales',
        'Tratamientos Faciales y Corporales a domicilio',
        'Tratamientos Faciales y Corporales en Chiloé',
        'Tratamientos Faciales y Corporales profesional',
        'Masajes',
        'Masajes a domicilio',
        'Masajes en Chiloé',
        'Masajes profesional',

        // Salud y Bienestar
        'Enfermería a Domicilio',
        'Enfermería a Domicilio en Chiloé',
        'Enfermería a Domicilio profesional',
        'Cuidado de Adultos Mayores',
        'Cuidado de Adultos Mayores a domicilio',
        'Cuidado de Adultos Mayores en Chiloé',
        'Cuidado de Adultos Mayores profesional',
        'Podología',
        'Podología a domicilio',
        'Podología en Chiloé',
        'Podología profesional',
        'Entrenador Personal / Yoga / Pilates',
        'Entrenador Personal / Yoga / Pilates a domicilio',
        'Entrenador Personal / Yoga / Pilates en Chiloé',
        'Entrenador Personal / Yoga / Pilates profesional',

        // Ubicaciones (Geolocalización)
        'Servicios en Castro',
        'Servicios en Ancud',
        'Servicios en Quellón',
        'Servicios en Dalcahue',
        'Servicios en Chonchi',
        'Servicios en Achao',
        'Servicios en Queilen',
        'Servicios en Quemchi',
        'Servicios en Curaco de Vélez',
        'Servicios en Puqueldón',

        // Intención / Urgencia
        'Maestros urgentes 24 horas',
        'Emergencias eléctricas',
        'Gasfitería de urgencia',
        'Presupuestos gratis construcción',
        'Mano de obra calificada',
        'Servicios a domicilio',
        'Profesionales verificados',

        // Long-tail keywords específicas
        'Reparación de calefont e instalaciones',
        'Destape de alcantarillado y desagües',
        'Instalación eléctrica domiciliaria',
        'Arreglo de techos y goteras',
        'Limpieza de caños y estufas a pellet',
        'Construcción de cabañas y ampliaciones',
        'Mantenimiento general de viviendas',
        'Corte de pasto y limpieza de parcelas',
    ],
    authors: [
        {
            name: 'Chiloé Servicios',
            url: siteConfig.url,
        },
    ],
    creator: 'Chiloé Servicios',
    openGraph: {
        type: 'website',
        locale: 'es_CL',
        url: siteConfig.url,
        title: siteConfig.name,
        description: siteConfig.description,
        siteName: siteConfig.name,
        images: [
            {
                url: siteConfig.ogImage,
                width: 1200,
                height: 630,
                alt: 'Chiloé Servicios - Directorio de Profesionales',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: siteConfig.name,
        description: siteConfig.description,
        images: [siteConfig.ogImage],
        creator: '@chiloeservicios',
    },
    icons: {
        icon: '/favicon.ico',
        shortcut: '/favicon.ico',
        apple: '/apple-touch-icon.png',
    },
    manifest: '/manifest.json',
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    // Nota: La canonical URL específica se define en cada página mediante generateMetadata
    // El layout solo define la canonical para la home
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await getServerSession(authOptions);

    // Transformar sesión a formato esperado por Navbar
    const currentUser = session?.user
        ? {
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.name || '',
              role: session.user.roles.includes('SuperAdministrador')
                  ? ('admin' as const)
                  : ('usuario' as const),
              subscription:
                  (session.user.nivelSuscripcion as unknown as SubscriptionLevel) ||
                  SubscriptionLevel.BASICO,
          }
        : null;

    // Schema.org para WebSite con SearchAction
    const webSiteSchema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${siteConfig.url}/#website`,
        name: siteConfig.name,
        url: siteConfig.url,
        description: siteConfig.description,
        potentialAction: {
            '@type': 'SearchAction',
            target: `${siteConfig.url}/buscar?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
        },
        inLanguage: 'es-CL',
    };

    // Schema.org Organization (para AI Search y citaciones)
    const organizationSchema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': `${siteConfig.url}/#organization`,
        name: siteConfig.name,
        url: siteConfig.url,
        logo: {
            '@type': 'ImageObject',
            url: `${siteConfig.url}/big-logo.png`,
            width: 2060,
            height: 800,
        },
        description: siteConfig.description,
        email: 'info@chiloeservicios.cl',
        telephone: '+56929540906',
        address: {
            '@type': 'PostalAddress',
            addressLocality: 'Castro',
            addressRegion: 'Los Lagos',
            addressCountry: 'CL',
        },
        areaServed: [
            {
                '@type': 'City',
                name: 'Castro',
                containedInPlace: { '@type': 'Place', name: 'Chiloé' },
            },
            {
                '@type': 'City',
                name: 'Ancud',
                containedInPlace: { '@type': 'Place', name: 'Chiloé' },
            },
            {
                '@type': 'City',
                name: 'Quellón',
                containedInPlace: { '@type': 'Place', name: 'Chiloé' },
            },
            {
                '@type': 'City',
                name: 'Dalcahue',
                containedInPlace: { '@type': 'Place', name: 'Chiloé' },
            },
        ],
        sameAs: [siteConfig.links.twitter, siteConfig.links.github],
        slogan: 'Encuentra los mejores profesionales en Chiloé',
        foundingDate: '2025',
        foundingLocation: {
            '@type': 'Place',
            name: 'Castro, Chiloé',
        },
    };

    return (
        <html lang="es" suppressHydrationWarning>
            <head>
                {/* Preconnect y DNS-Prefetch para recursos externos */}
                <link rel="preconnect" href="https://www.googletagmanager.com" />
                <link rel="preconnect" href="https://www.google-analytics.com" />
                <link rel="dns-prefetch" href="https://images.unsplash.com" />
                <link rel="dns-prefetch" href="https://placehold.co" />
                <link rel="preconnect" href="https://vercel-storage.com" crossOrigin="anonymous" />
                {/* Google Tag Manager */}
                <script
                    // biome-ignore lint/security/noDangerouslySetInnerHtml: Requerido para Google Tag Manager
                    dangerouslySetInnerHTML={{
                        __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-PT2PFWF9');`,
                    }}
                />
                {/* End Google Tag Manager */}
                {/* Google Analytics (gtag.js) */}
                <script async src="https://www.googletagmanager.com/gtag/js?id=G-WREYNC9F4M" />
                <script
                    // biome-ignore lint/security/noDangerouslySetInnerHtml: Requerido para Google Analytics
                    dangerouslySetInnerHTML={{
                        __html: `
                            window.dataLayer = window.dataLayer || [];
                            function gtag(){dataLayer.push(arguments);}
                            gtag('js', new Date());
                            gtag('config', 'G-WREYNC9F4M');
                        `,
                    }}
                />
                {/* End Google Analytics */}
            </head>
            <body className={`${inter.className} antialiased`}>
                {/* Google Tag Manager (noscript) */}
                <noscript>
                    <iframe
                        src="https://www.googletagmanager.com/ns.html?id=GTM-PT2PFWF9"
                        height="0"
                        width="0"
                        style={{ display: 'none', visibility: 'hidden' }}
                        title="Google Tag Manager"
                    />
                </noscript>
                {/* End Google Tag Manager (noscript) */}
                {/* Structured Data: WebSite */}
                <script
                    type="application/ld+json"
                    // biome-ignore lint/security/noDangerouslySetInnerHtml: Requerido para JSON-LD schema SEO
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
                />
                {/* Structured Data: Organization (para AI Search y citaciones) */}
                <script
                    type="application/ld+json"
                    // biome-ignore lint/security/noDangerouslySetInnerHtml: Requerido para JSON-LD schema SEO
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
                />
                <Providers>
                    <div className="flex min-h-screen flex-col">
                        <Navbar user={currentUser} />
                        <main className="flex-grow">{children}</main>
                        <Footer />
                    </div>
                </Providers>
            </body>
        </html>
    );
}
