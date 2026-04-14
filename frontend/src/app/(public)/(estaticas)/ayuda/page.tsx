import type React from 'react';

import { ChevronDown } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Centro de Ayuda - Preguntas Frecuentes',
    description:
        'Respuestas a las preguntas más comunes sobre Atlas Services. Cómo encontrar profesionales, cómo publicar servicios, precios, verificación y más.',
    keywords: [
        'ayuda Atlas Services',
        'preguntas frecuentes',
        'FAQ servicios profesionales',
        'cómo funciona',
        'dudas plataforma',
        'ayuda usuarios',
        'soporte',
    ],
    openGraph: {
        title: 'Centro de Ayuda - Atlas Services',
        description:
            'Todo lo que necesitas saber sobre cómo encontrar y publicar servicios profesionales.',
        type: 'website',
    },
    alternates: {
        canonical: '/ayuda',
    },
};

const AyudaPage: React.FC = () => {
    // FAQ Schema optimizado para AI Search y Google Rich Results
    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
            {
                '@type': 'Question',
                name: '¿Cómo encuentro un gasfíter en Castro?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Para encontrar un gasfíter cerca de ti: 1) Ve a atlasservicios.com/buscar, 2) Selecciona la categoría "Gasfíter", 3) Filtra por tu zona, 4) Verás perfiles verificados con calificaciones, precios y contacto directo. Puedes contactar por WhatsApp o teléfono sin intermediación.',
                },
            },
            {
                '@type': 'Question',
                name: '¿Cuánto cuesta publicar un servicio en Atlas Services?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Publicar un servicio es completamente GRATIS para empezar. Solo necesitas crear una cuenta y llenar el formulario con tu oficio. Los planes Premium opcionales van desde $9,990/mes (1 mes) hasta $52,990 (12 meses con descuento). El plan Premium te da prioridad en búsquedas, sello de verificación Pro y soporte 24/7.',
                },
            },
            {
                '@type': 'Question',
                name: '¿Los profesionales en Atlas Services están verificados?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Sí. Todos los profesionales tienen: 1) Identidad verificada mediante documentación, 2) Sistema de calificaciones públicas (estrellas y reseñas), 3) Historial de trabajos visible, 4) Sello "Pro" para proveedores Premium. Las reseñas son públicas y no pueden ser eliminadas. Además, contamos con la Garantía Atlas que ofrece mediación en caso de conflictos.',
                },
            },
            {
                '@type': 'Question',
                name: '¿En qué países opera Atlas Services?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Atlas Services opera en 5 países: Chile (CL), Argentina (AR), Uruguay (UY), España (ES) y Estados Unidos (US). En cada país puedes filtrar servicios por región y localidad en el buscador.',
                },
            },
            {
                '@type': 'Question',
                name: '¿Necesito un electricista urgente en Ancud, cómo lo contacto?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Para emergencias: 1) Busca el tipo de profesional en atlasservicios.com, 2) Filtra por tu zona, 3) Verás teléfonos y WhatsApp directos, 4) Contacta directamente sin intermediarios. Muchos profesionales ofrecen servicio de emergencia 24/7. Los perfiles Premium suelen responder más rápido.',
                },
            },
            {
                '@type': 'Question',
                name: '¿Hay servicios de flete y mudanza?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Sí, hay múltiples proveedores de fletes y mudanzas en Atlas Services. Ofrecen: Transporte de muebles, mudanzas completas, fletes de materiales de construcción, y más. Puedes comparar precios y ver calificaciones antes de contratar.',
                },
            },
            {
                '@type': 'Question',
                name: '¿Qué oficios puedo encontrar en Atlas Services?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Oficios disponibles: Gasfíter (reparación calefont, destapes, instalaciones), Electricista (instalaciones SEC, emergencias), Carpintero (muebles, construcciones), Maestro Constructor (ampliaciones, reparaciones), Pintor (casas, estructuras), Flete y Mudanza (transporte isla), Jardinero (corte pasto, paisajismo), Técnico Refrigeración (aires, refrigeradores), Mecánico (reparaciones a domicilio), Soldador, y más. Total: 15+ categorías de servicios.',
                },
            },
            {
                '@type': 'Question',
                name: '¿Cómo funciona el pago en Atlas Services?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Atlas Services NO cobra comisiones ni intermedia pagos. El pago se acuerda directamente entre el cliente y el proveedor. Nosotros solo conectamos ambas partes. Puedes: 1) Solicitar cotización gratis, 2) Acordar precio y forma de pago (efectivo, transferencia, etc.), 3) Pagar directamente al proveedor después del trabajo.',
                },
            },
            {
                '@type': 'Question',
                name: '¿Qué es la Garantía Atlas?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'La Garantía Atlas es nuestro compromiso de mediación. Si el servicio no cumple lo acordado: 1) Contacta a soporte (info@atlasservicios.com), 2) Nuestro equipo media entre ambas partes, 3) Buscamos una solución justa (reembolso, trabajo adicional, etc.), 4) El proveedor puede ser suspendido si no responde. Esta garantía aplica para todos los servicios contratados a través de la plataforma.',
                },
            },
            {
                '@type': 'Question',
                name: '¿Cuál es la diferencia entre un servicio básico y Premium?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Servicios Básicos (GRATIS): Aparecen en búsquedas normales, perfil estándar, contacto directo. Servicios Premium ($9,990+/mes): Prioridad MÁXIMA en búsquedas (aparecen primero), Sello "Pro" visible, Destaque visual con marco dorado, Soporte prioritario 24/7, Estadísticas de visitas. Los proveedores Premium obtienen hasta 5x más clientes según nuestros datos.',
                },
            },
            {
                '@type': 'Question',
                name: '¿Puedo publicar varios servicios con la misma cuenta?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Sí, puedes publicar múltiples servicios con una sola cuenta. Por ejemplo, si eres gasfíter Y electricista, creas dos publicaciones separadas. Cada servicio tiene su propia página, calificaciones y puede tener su propio plan (uno Premium y otro Básico). No hay límite de servicios publicados por cuenta.',
                },
            },
            {
                '@type': 'Question',
                name: '¿Cómo dejo una reseña o calificación?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Para dejar una reseña: 1) Ve a la página del servicio que contrataste, 2) Haz clic en "Dejar una reseña", 3) Inicia sesión con tu cuenta, 4) Califica de 1 a 5 estrellas, 5) Escribe un comentario detallado (opcional pero recomendado), 6) Envía. Tu reseña será pública e inmediata. Las reseñas ayudan a otros usuarios a tomar decisiones informadas.',
                },
            },
            {
                '@type': 'Question',
                name: '¿Necesito crear cuenta para buscar servicios?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'NO necesitas cuenta para buscar y ver servicios. El buscador y todos los perfiles son públicos. Solo necesitas cuenta si quieres: 1) Dejar reseñas, 2) Publicar tus propios servicios, 3) Guardar favoritos. Buscar y contactar proveedores es 100% libre sin registro.',
                },
            },
            {
                '@type': 'Question',
                name: '¿Qué hago si un proveedor no responde mi mensaje?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Si un proveedor no responde en 24-48 horas: 1) Contacta a otros proveedores del mismo oficio (hay múltiples opciones), 2) Los proveedores Premium suelen responder más rápido, 3) Reporta al proveedor inactivo a soporte (afecta su visibilidad), 4) Puedes dejar un comentario sobre la falta de respuesta. Recomendamos contactar a 2-3 proveedores en paralelo para obtener respuesta más rápida.',
                },
            },
            {
                '@type': 'Question',
                name: '¿Cómo se ordenan los resultados de la búsqueda?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Los resultados se ordenan por: 1) Nivel de servicio (los Premium aparecen primero), 2) Calificación (los profesionales con mejores reseñas suben de posición), 3) Novedad (los servicios más recientes desempatan). Los servicios con calificaciones siempre aparecen sobre los que no tienen dentro de su mismo plan.',
                },
            },
            {
                '@type': 'Question',
                name: '¿Puedo cancelar mi suscripción Premium en cualquier momento?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Sí, puedes cancelar en cualquier momento desde tu perfil. IMPORTANTE: No hay reembolsos proporcionales. Si pagaste un mes y cancelas a los 15 días, tu servicio permanecerá Premium hasta el final del periodo pagado, pero no se renovará. Para cambiar de plan (ej: de 1 mes a 3 meses), contacta a soporte para aplicar descuentos.',
                },
            },
        ],
    };

    const faqs = [
        {
            pregunta: '¿Cómo encuentro un gasfíter en Castro?',
            respuesta: (
                <div className="space-y-3">
                    <p>Para encontrar un gasfíter en Castro:</p>
                    <ol className="list-decimal space-y-2 pl-5">
                        <li>Ve a atlasservicios.com/buscar</li>
                        <li>Selecciona la categoría &quot;Gasfíter&quot;</li>
                        <li>Filtra por comuna &quot;Castro&quot;</li>
                        <li>
                            Verás perfiles verificados con calificaciones, precios y contacto
                            directo
                        </li>
                    </ol>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Puedes contactar por WhatsApp o teléfono sin intermediación. Todos los
                        gasfíter están verificados y tienen reseñas de usuarios.
                    </p>
                </div>
            ),
        },
        {
            pregunta: '¿Cuánto cuesta publicar un servicio en Atlas Services?',
            respuesta: (
                <div className="space-y-3">
                    <p className="font-bold text-green-600 dark:text-green-400">
                        Publicar un servicio es completamente GRATIS para empezar.
                    </p>
                    <p>
                        Solo necesitas crear una cuenta y llenar el formulario con tu oficio. Los
                        planes Premium opcionales van desde:
                    </p>
                    <ul className="list-disc space-y-1 pl-5">
                        <li>$9,990/mes (1 mes)</li>
                        <li>$26,990 (3 meses - Más popular)</li>
                        <li>$52,990 (12 meses con descuento)</li>
                    </ul>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        El plan Premium te da prioridad en búsquedas, sello de verificación Pro y
                        soporte 24/7.
                    </p>
                </div>
            ),
        },
        {
            pregunta: '¿Los profesionales en Atlas Services están verificados?',
            respuesta: (
                <div className="space-y-3">
                    <p className="font-bold text-blue-600 dark:text-blue-400">
                        Sí, todos los profesionales están verificados.
                    </p>
                    <p>Cada proveedor tiene:</p>
                    <ul className="list-disc space-y-1 pl-5">
                        <li>Identidad verificada mediante documentación</li>
                        <li>Sistema de calificaciones públicas (estrellas y reseñas)</li>
                        <li>Historial de trabajos visible</li>
                        <li>Sello &quot;Pro&quot; para proveedores Premium</li>
                    </ul>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Las reseñas son públicas y no pueden ser eliminadas. Además, contamos con la
                        Garantía Atlas que ofrece mediación en caso de conflictos.
                    </p>
                </div>
            ),
        },
        {
            pregunta: '¿En qué países opera Atlas Services?',
            respuesta: (
                <div className="space-y-3">
                    <p className="font-bold">
                        Atlas Services opera en 5 países:
                    </p>
                    <ul className="grid grid-cols-2 gap-2">
                        <li>✓ Chile</li>
                        <li>✓ Argentina</li>
                        <li>✓ Uruguay</li>
                        <li>✓ España</li>
                        <li>✓ Estados Unidos</li>
                    </ul>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Puedes filtrar servicios por región y localidad en el buscador de cada país.
                    </p>
                </div>
            ),
        },
        {
            pregunta: '¿Necesito un electricista urgente en Ancud, cómo lo contacto?',
            respuesta: (
                <div className="space-y-3">
                    <p className="font-bold text-red-600 dark:text-red-400">
                        Para emergencias eléctricas en Ancud:
                    </p>
                    <ol className="list-decimal space-y-2 pl-5">
                        <li>Busca el profesional en atlasservicios.com</li>
                        <li>Filtra por &quot;Ancud&quot;</li>
                        <li>Verás teléfonos y WhatsApp directos</li>
                        <li>Contacta directamente sin intermediarios</li>
                    </ol>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Muchos electricistas ofrecen servicio de emergencia 24/7. Los perfiles
                        Premium suelen responder más rápido. También puedes llamar a varios
                        proveedores en paralelo para encontrar disponibilidad inmediata.
                    </p>
                </div>
            ),
        },
        {
            pregunta: '¿Hay servicios de flete y mudanza dentro de Chiloé?',
            respuesta: (
                <div className="space-y-3">
                    <p className="font-bold">
                        Sí, hay múltiples proveedores de fletes y mudanzas en Atlas Services.
                    </p>
                    <p>Ofrecen:</p>
                    <ul className="list-disc space-y-1 pl-5">
                        <li>Transporte de muebles dentro de la isla</li>
                        <li>
                            Mudanzas completas entre comunas (Castro-Ancud, Castro-Quellón, etc.)
                        </li>
                        <li>Fletes de materiales de construcción</li>
                        <li>Traslados desde el puerto</li>
                    </ul>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Puedes comparar precios y ver calificaciones antes de contratar. La mayoría
                        cubre toda la isla.
                    </p>
                </div>
            ),
        },
        {
            pregunta: '¿Qué oficios puedo encontrar en Atlas Services?',
            respuesta: (
                <div className="space-y-3">
                    <p className="font-bold">Oficios disponibles:</p>
                    <ul className="grid grid-cols-1 gap-1 md:grid-cols-2">
                        <li>✓ Gasfíter (reparación calefont, destapes, instalaciones)</li>
                        <li>✓ Electricista (instalaciones SEC, emergencias)</li>
                        <li>✓ Carpintero (muebles, construcciones)</li>
                        <li>✓ Maestro Constructor (ampliaciones, reparaciones)</li>
                        <li>✓ Pintor (casas, estructuras)</li>
                        <li>✓ Flete y Mudanza (transporte isla)</li>
                        <li>✓ Jardinero (corte pasto, paisajismo)</li>
                        <li>✓ Técnico Refrigeración (aires, refrigeradores)</li>
                        <li>✓ Mecánico (reparaciones a domicilio)</li>
                        <li>✓ Soldador</li>
                        <li>✓ Y más...</li>
                    </ul>
                    <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                        Total: 15+ categorías de servicios profesionales
                    </p>
                </div>
            ),
        },
        {
            pregunta: '¿Cómo funciona el pago en Atlas Services?',
            respuesta: (
                <div className="space-y-3">
                    <p className="font-bold text-green-600 dark:text-green-400">
                        Atlas Services NO cobra comisiones ni intermedia pagos.
                    </p>
                    <p>El pago se acuerda directamente entre el cliente y el proveedor:</p>
                    <ol className="list-decimal space-y-2 pl-5">
                        <li>Solicita cotización gratis</li>
                        <li>Acuerda precio y forma de pago (efectivo, transferencia, etc.)</li>
                        <li>Paga directamente al proveedor después del trabajo</li>
                    </ol>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Recomendamos pagar después de verificar la calidad del servicio.
                    </p>
                </div>
            ),
        },
        {
            pregunta: '¿Qué es la Garantía Atlas?',
            respuesta: (
                <div className="space-y-3">
                    <p className="font-bold">
                        La Garantía Atlas es nuestro compromiso de mediación.
                    </p>
                    <p>Si el servicio no cumple lo acordado:</p>
                    <ol className="list-decimal space-y-2 pl-5">
                        <li>
                            Contacta a soporte (info@atlasservicios.com)
                        </li>
                        <li>Nuestro equipo media entre ambas partes</li>
                        <li>Buscamos una solución justa (reembolso, trabajo adicional, etc.)</li>
                        <li>El proveedor puede ser suspendido si no responde</li>
                    </ol>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Esta garantía aplica para todos los servicios contratados a través de la
                        plataforma.
                    </p>
                </div>
            ),
        },
        {
            pregunta: '¿Cuál es la diferencia entre un servicio básico y Premium?',
            respuesta: (
                <div className="space-y-4">
                    <div>
                        <p className="mb-2 font-bold">Servicios Básicos (GRATIS):</p>
                        <ul className="list-disc space-y-1 pl-5 text-sm">
                            <li>Aparecen en búsquedas normales</li>
                            <li>Perfil estándar</li>
                            <li>Contacto directo</li>
                        </ul>
                    </div>
                    <div>
                        <p className="mb-2 font-bold text-blue-600 dark:text-blue-400">
                            Servicios Premium ($9,990+/mes):
                        </p>
                        <ul className="list-disc space-y-1 pl-5 text-sm">
                            <li>Prioridad MÁXIMA en búsquedas (aparecen primero)</li>
                            <li>Sello &quot;Pro&quot; visible</li>
                            <li>Destaque visual con marco dorado</li>
                            <li>Soporte prioritario 24/7</li>
                            <li>Estadísticas de visitas</li>
                        </ul>
                    </div>
                    <p className="text-sm font-bold text-green-600 dark:text-green-400">
                        Los proveedores Premium obtienen hasta 5x más clientes según nuestros datos.
                    </p>
                </div>
            ),
        },
        {
            pregunta: '¿Cómo se ordenan los resultados de la búsqueda?',
            respuesta: (
                <div className="space-y-3">
                    <p>
                        Para garantizar la mejor experiencia y premiar la calidad, los servicios se
                        muestran siguiendo este orden de prioridad:
                    </p>
                    <ol className="list-decimal space-y-2 pl-5">
                        <li>
                            <span className="font-bold">Prioridad Premium:</span> Los proveedores
                            que tienen un plan activo aparecen siempre en las primeras posiciones.
                        </li>
                        <li>
                            <span className="font-bold">Calificaciones:</span> Dentro de cada nivel
                            (Premium o Básico), los profesionales con mejores notas y más reseñas de
                            clientes suben automáticamente de posición.
                        </li>
                        <li>
                            <span className="font-bold">Novedad:</span> En caso de empate en plan y
                            nota, mostramos primero los servicios publicados o actualizados más
                            recientemente.
                        </li>
                    </ol>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Los servicios que aún no tienen calificaciones aparecen al final de su
                        respectivo grupo (Premium o Básico). ¡Incentivamos a los profesionales a dar
                        un gran servicio para subir en el ranking!
                    </p>
                </div>
            ),
        },
    ];

    return (
        <>
            {/* FAQ Schema para AI Search y Google Rich Results */}
            <script
                type="application/ld+json"
                // biome-ignore lint/security/noDangerouslySetInnerHtml: Requerido para JSON-LD schema SEO
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(faqSchema).replace(/</g, '\\u003c'),
                }}
            />

            <section className="bg-background min-h-screen py-12 md:py-20">
                <div className="container mx-auto max-w-4xl px-4">
                    {/* Header */}
                    <div className="mb-12 text-center">
                        <h1 className="mb-4 text-3xl leading-tight font-black text-gray-900 md:text-5xl dark:text-white">
                            Centro de Ayuda
                        </h1>
                        <p className="mx-auto max-w-2xl text-base text-gray-600 md:text-lg dark:text-gray-400">
                            Todo lo que necesitas saber sobre cómo encontrar y publicar servicios
                            profesionales
                        </p>
                    </div>

                    {/* FAQs */}
                    <div className="space-y-4">
                        {faqs.map((faq) => (
                            <details
                                key={faq.pregunta}
                                className="group rounded-2xl border border-gray-100 bg-white p-6 transition-all hover:shadow-md dark:border-white/10 dark:bg-gray-900/40"
                            >
                                <summary className="flex cursor-pointer items-center justify-between text-left text-base font-bold text-gray-900 md:text-lg dark:text-white">
                                    <span>{faq.pregunta}</span>
                                    <ChevronDown
                                        size={20}
                                        className="shrink-0 transition-transform group-open:rotate-180"
                                    />
                                </summary>
                                <div className="mt-4 text-sm text-gray-600 md:text-base dark:text-gray-400">
                                    {faq.respuesta}
                                </div>
                            </details>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="mt-12 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-8 text-center dark:border-blue-900/30 dark:from-blue-900/20 dark:to-indigo-900/20">
                        <h3 className="mb-2 text-xl font-bold text-gray-900 md:text-2xl dark:text-white">
                            ¿No encontraste tu respuesta?
                        </h3>
                        <p className="mb-6 text-sm text-gray-600 md:text-base dark:text-gray-400">
                            Nuestro equipo está disponible para ayudarte
                        </p>
                        <a
                            href="/contacto"
                            className="inline-block rounded-2xl bg-blue-600 px-8 py-4 text-sm font-bold text-white transition-all hover:bg-blue-700 md:text-base"
                        >
                            Contactar Soporte
                        </a>
                    </div>
                </div>
            </section>
        </>
    );
};

export default AyudaPage;
