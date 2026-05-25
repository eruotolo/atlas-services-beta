import type React from 'react';

import { Award, CheckCircle, MessageSquare, PlusCircle, Search, Star } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: '¿Cómo funciona Chiloé Servicios?',
    description:
        'Descubre cómo conectar con profesionales locales en Chiloé. Simple, rápido y confiable. Para clientes: busca, contacta y califica. Para proveedores: publica, destácate y gana.',
    keywords: [
        'cómo funciona Chiloé Servicios',
        'contratar servicios en Chiloé',
        'publicar servicios Chiloé',
        'directorio profesionales',
        'guía uso plataforma',
    ],
    openGraph: {
        title: '¿Cómo funciona Chiloé Servicios?',
        description:
            'La plataforma más simple para conectar el talento de nuestra isla con quienes necesitan una solución rápida.',
        type: 'website',
    },
    alternates: {
        canonical: '/como-funciona',
    },
};

const ComoFuncionaPage: React.FC = () => {
    // FAQ Schema para SEO
    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
            {
                '@type': 'Question',
                name: '¿Cómo puedo encontrar un profesional en Chiloé?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Usa nuestro buscador para filtrar por categoría (gasfíter, electricista, carpintero, etc.) y por comuna (Castro, Ancud, Quellón). Luego revisa los perfiles y contacta directamente por WhatsApp o teléfono.',
                },
            },
            {
                '@type': 'Question',
                name: '¿Cómo puedo publicar mi servicio profesional?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Crea tu perfil en minutos desde la sección Publicar. Es gratis empezar. Si quieres aparecer primero en las búsquedas, puedes activar un plan Premium.',
                },
            },
            {
                '@type': 'Question',
                name: '¿Qué beneficios tiene la suscripción Premium?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Con Premium obtienes prioridad máxima en búsquedas, sello de verificación Pro, soporte prioritario 24/7 y mayor visibilidad para atraer más clientes.',
                },
            },
            {
                '@type': 'Question',
                name: '¿Es seguro contratar por Chiloé Servicios?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Todos los profesionales son verificados y pueden ser calificados por otros usuarios. Revisa las reseñas antes de contactar. Además, contamos con Garantía Chilota para mediar en caso de conflictos.',
                },
            },
            {
                '@type': 'Question',
                name: '¿En qué comunas de Chiloé están disponibles?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Estamos en toda la Isla de Chiloé: Castro, Ancud, Quellón, Dalcahue, Chonchi, Achao, Queilen, Quemchi, Curaco de Vélez y Puqueldón.',
                },
            },
        ],
    };

    return (
        <>
            {/* FAQ Structured Data */}
            <script
                type="application/ld+json"
                // biome-ignore lint/security/noDangerouslySetInnerHtml: Requerido para JSON-LD schema SEO
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(faqSchema).replace(/</g, '\\u003c'),
                }}
            />
            <div className="bg-background">
                {/* Hero */}
                <section className="bg-brand px-4 py-12 text-center md:py-20 dark:bg-brand-hover">
                    <div className="container mx-auto max-w-site px-4">
                        <h1 className="mb-4 text-3xl leading-tight font-black text-white md:mb-6 md:text-5xl">
                            ¿Cómo funciona Chiloé Servicios?
                        </h1>
                        <p className="mx-auto max-w-2xl text-base text-brand/20 opacity-90 md:text-lg">
                            La plataforma más simple para conectar el talento de nuestra isla con
                            quienes necesitan una solución rápida y confiable.
                        </p>
                    </div>
                </section>

                {/* For Users */}
                <section className="bg-background w-full py-12 md:py-20">
                    <div className="container mx-auto max-w-site px-4 sm:px-6 lg:px-8">
                        <div className="mb-10 text-center md:mb-16">
                            <span className="text-[10px] font-black tracking-widest text-brand uppercase md:text-sm dark:text-brand-light">
                                Para Clientes
                            </span>
                            <h2 className="mt-2 text-2xl font-black text-gray-900 md:text-3xl dark:text-white">
                                Encuentra al experto ideal
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 gap-10 text-center md:grid-cols-3 md:gap-12">
                            {[
                                {
                                    icon: Search,
                                    title: '1. Busca',
                                    desc: 'Filtra por categoría y comuna. Castro, Ancud o Quellón, ¡estamos en todos lados!',
                                },
                                {
                                    icon: MessageSquare,
                                    title: '2. Contacta',
                                    desc: 'Revisa su perfil y contáctalo directamente por WhatsApp o teléfono.',
                                },
                                {
                                    icon: Star,
                                    title: '3. Califica',
                                    desc: 'Después del trabajo, deja tu reseña para ayudar a otros vecinos.',
                                },
                            ].map((item) => (
                                <div key={item.title} className="space-y-3 md:space-y-4">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/5 text-brand md:h-16 md:w-16 dark:bg-brand/10 dark:text-brand-light">
                                        <item.icon size={28} className="md:h-8 md:w-8" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 md:text-xl dark:text-white">
                                        {item.title}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-gray-500 md:text-base dark:text-gray-400">
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* For Providers */}
                <section className="dark:bg-background w-full border-t border-gray-100 bg-gray-50 py-12 md:py-20 dark:border-gray-800">
                    <div className="container mx-auto max-w-site px-4 sm:px-6 lg:px-8">
                        <div className="mb-10 text-center md:mb-16">
                            <span className="text-[10px] font-black tracking-widest text-green-600 uppercase md:text-sm dark:text-green-400">
                                Para Proveedores
                            </span>
                            <h2 className="mt-2 text-2xl font-black text-gray-900 md:text-3xl dark:text-white">
                                Haz crecer tu oficio
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 gap-10 text-center md:grid-cols-3 md:gap-12">
                            {[
                                {
                                    icon: PlusCircle,
                                    title: '1. Publica',
                                    desc: 'Crea tu perfil en minutos. Es fácil, rápido y gratis empezar.',
                                },
                                {
                                    icon: Award,
                                    title: '2. Destácate con Premium',
                                    desc: 'Activa un plan Premium para aparecer primero en las búsquedas y obtener el sello de verificación.',
                                },
                                {
                                    icon: CheckCircle,
                                    title: '3. Gana',
                                    desc: 'Recibe llamadas de nuevos clientes todos los días directamente.',
                                },
                            ].map((item) => (
                                <div key={item.title} className="space-y-3 md:space-y-4">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-600 md:h-16 md:w-16 dark:bg-green-900/20 dark:text-green-400">
                                        <item.icon size={28} className="md:h-8 md:w-8" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 md:text-xl dark:text-white">
                                        {item.title}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-gray-500 md:text-base dark:text-gray-400">
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
};

export default ComoFuncionaPage;
