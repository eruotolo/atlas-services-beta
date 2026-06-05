import { Geist, Geist_Mono, Instrument_Serif } from 'next/font/google';

import type { Metadata } from 'next';
import { headers } from 'next/headers';

import ScrollToTop from '@/shared/components/ui/ScrollToTop';
import { ToastProvider } from '@/shared/components/ui/ToastProvider';

import { Providers } from '@/lib/providers/Providers';

import './globals.css';

const geistSans = Geist({
    subsets: ['latin'],
    variable: '--font-geist',
    weight: ['300', '400', '500', '600', '700', '800', '900'],
    display: 'swap',
});

const geistMono = Geist_Mono({
    subsets: ['latin'],
    variable: '--font-geist-mono',
    weight: ['400', '500', '600'],
    display: 'swap',
});

const instrumentSerif = Instrument_Serif({
    subsets: ['latin'],
    variable: '--font-instrument-serif',
    weight: ['400'],
    style: ['normal', 'italic'],
    display: 'swap',
});

// Configuración global del sitio
const siteConfig = {
    name: 'Hireeo',
    description:
        'Encuentra electricistas, carpinteros, gasfíter, fletes y más profesionales verificados cerca de ti.',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://hireeo.app',
    ogImage: '/hireeo-og.png',
    links: {
        twitter: 'https://twitter.com/hireeo',
        github: 'https://github.com/hireeo',
    },
};

export const metadata: Metadata = {
    metadataBase: new URL(siteConfig.url),
    title: {
        default: siteConfig.name,
        template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    other: {
        'DC.title': 'Hireeo - Directorio de Profesionales',
        'DC.description':
            'Plataforma que conecta usuarios con proveedores de servicios profesionales. Gasfíter, electricista, carpintero, fletes y más.',
        'DC.subject': 'Directorio servicios, Profesionales, Servicios hogar, Oficios manuales',
    },
    keywords: [
        'Hireeo',
        'Directorio de servicios',
        'Gasfíter',
        'Electricista',
        'Carpintero',
        'Flete y Mudanza',
        'Servicios profesionales',
        'Profesionales verificados',
        'Servicios a domicilio',
        'Presupuestos gratis',
    ],
    authors: [{ name: 'Hireeo', url: siteConfig.url }],
    creator: 'Hireeo',
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
                alt: 'Hireeo - Directorio de Profesionales',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: siteConfig.name,
        description: siteConfig.description,
        images: [siteConfig.ogImage],
        creator: '@hireeo',
    },
    icons: {
        icon: [
            { url: '/favicon.ico', sizes: '16x16 32x32 48x48' },
            { url: '/icon-256.png', sizes: '256x256', type: 'image/png' },
            { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
        shortcut: '/favicon.ico',
        apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
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
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const headersList = await headers();
    const lang = headersList.get('x-hireeo-lang') ?? 'es';

    const webSiteSchema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${siteConfig.url}/#website`,
        name: siteConfig.name,
        url: siteConfig.url,
        description: siteConfig.description,
        potentialAction: {
            '@type': 'SearchAction',
            target: `${siteConfig.url}/cl/buscar?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
        },
        inLanguage: 'es',
    };

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
        email: 'info@hireeo.app',
        foundingDate: '2025',
        sameAs: [siteConfig.links.twitter, siteConfig.links.github],
    };

    return (
        <html
            lang={lang}
            suppressHydrationWarning
            className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable}`}
        >
            <head>
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
            </head>
            <body className={`${geistSans.className} antialiased`}>
                <noscript>
                    <iframe
                        src="https://www.googletagmanager.com/ns.html?id=GTM-PT2PFWF9"
                        height="0"
                        width="0"
                        style={{ display: 'none', visibility: 'hidden' }}
                        title="Google Tag Manager"
                    />
                </noscript>
                <script
                    type="application/ld+json"
                    // biome-ignore lint/security/noDangerouslySetInnerHtml: Requerido para JSON-LD schema SEO
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
                />
                <script
                    type="application/ld+json"
                    // biome-ignore lint/security/noDangerouslySetInnerHtml: Requerido para JSON-LD schema SEO
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
                />
                <Providers>
                    <ToastProvider>
                        {children}
                        <ScrollToTop />
                    </ToastProvider>
                </Providers>
            </body>
        </html>
    );
}
