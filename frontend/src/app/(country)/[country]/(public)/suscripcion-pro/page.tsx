import Link from 'next/link';

import type { Metadata } from 'next';
import { CheckCircle, Crown, Zap } from 'lucide-react';

import { COUNTRY_SEO_CONFIG, formatPrice } from '@/features/geo/lib/countryUtils';
import { obtenerPreciosPremiumActivos } from '@/features/payments/actions';

type Props = { params: Promise<{ country: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { country } = await params;
    const countryName = COUNTRY_SEO_CONFIG[country]?.countryName ?? country.toUpperCase();
    return {
        title: 'Planes Premium - Suscripción Pro',
        description: `Destaca tu servicio en ${countryName} con nuestros planes Premium. Aparece primero en búsquedas y atrae hasta 5x más clientes.`,
        robots: { index: true, follow: true },
    };
}

export default async function SuscripcionProCountryPage({ params }: Props) {
    const { country } = await params;
    const precios = await obtenerPreciosPremiumActivos(country);

    return (
        <section className="bg-background min-h-screen py-12 md:py-16">
            <div className="container mx-auto max-w-7xl px-4">
                <div className="mb-12 text-center md:mb-16">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-1.5 text-xs font-bold tracking-widest text-white uppercase md:mb-6 md:text-sm">
                        <Crown size={16} /> Hazte Premium
                    </div>
                    <h1 className="mb-4 text-3xl leading-tight font-black text-gray-900 md:text-5xl dark:text-white">
                        Destaca tu Servicio
                    </h1>
                    <p className="mx-auto max-w-2xl px-2 text-base text-gray-600 md:text-lg dark:text-gray-400">
                        Aparece primero en las búsquedas y atrae hasta 5 veces más clientes con
                        nuestros planes premium.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-4 md:gap-6">
                    {precios.length > 0 ? (
                        precios.map((plan) => {
                            const esRecomendado = plan.duracionMeses === 3;
                            const precioMensual = Math.round(plan.precio / plan.duracionMeses);

                            return (
                                <div
                                    key={plan.id}
                                    className={`relative rounded-[2rem] bg-white p-8 shadow-xl transition-all md:rounded-3xl dark:bg-gray-900/40 dark:backdrop-blur-xl ${
                                        esRecomendado
                                            ? 'z-10 ring-4 ring-blue-500 md:scale-105 dark:ring-blue-600'
                                            : 'border border-gray-100 dark:border-white/10'
                                    }`}
                                >
                                    {esRecomendado && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-1 text-[10px] font-black tracking-widest text-white uppercase shadow-lg">
                                            Más Popular
                                        </div>
                                    )}
                                    <h3 className="mb-2 text-xl font-black text-gray-900 md:text-2xl dark:text-white">
                                        Plan {plan.duracionMeses}{' '}
                                        {plan.duracionMeses === 1 ? 'Mes' : 'Meses'}
                                    </h3>
                                    <div className="mb-6">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-black text-blue-600 md:text-4xl dark:text-blue-400">
                                                {formatPrice(plan.precio, country)}
                                            </span>
                                            <span className="text-xs font-bold text-gray-400 uppercase md:text-sm">
                                                / Total
                                            </span>
                                        </div>
                                        {plan.duracionMeses > 1 && (
                                            <p className="mt-1 text-xs font-medium tracking-tight text-blue-400 uppercase dark:text-blue-500">
                                                Solo {formatPrice(precioMensual, country)} al mes
                                            </p>
                                        )}
                                    </div>
                                    <ul className="mb-8 space-y-3">
                                        <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <CheckCircle
                                                size={18}
                                                className="mt-0.5 shrink-0 text-green-500 dark:text-green-400"
                                            />
                                            <span>Prioridad máxima en búsquedas</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <CheckCircle
                                                size={18}
                                                className="mt-0.5 shrink-0 text-green-500 dark:text-green-400"
                                            />
                                            <span>Sello de confianza &quot;Pro&quot;</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <CheckCircle
                                                size={18}
                                                className="mt-0.5 shrink-0 text-green-500 dark:text-green-400"
                                            />
                                            <span>Soporte prioritario 24/7</span>
                                        </li>
                                        {plan.duracionMeses >= 6 && (
                                            <li className="flex items-start gap-2 text-sm font-bold text-blue-600 dark:text-blue-400">
                                                <CheckCircle
                                                    size={18}
                                                    className="mt-0.5 shrink-0 text-blue-500 dark:text-blue-400"
                                                />
                                                <span>Ahorro máximo incluido</span>
                                            </li>
                                        )}
                                    </ul>
                                    <Link
                                        href={`/${country}/publicar`}
                                        className={`block w-full rounded-2xl py-4 text-center text-sm font-black tracking-widest uppercase transition-all ${
                                            esRecomendado
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700 dark:shadow-none'
                                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        Contratar
                                    </Link>
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400">
                            Cargando planes disponibles...
                        </div>
                    )}
                </div>

                <div className="mt-12 rounded-[2rem] border border-blue-50 bg-white p-8 text-center shadow-sm md:mt-16 md:rounded-3xl md:p-10 dark:border-white/10 dark:bg-gray-900/40">
                    <Zap size={40} className="mx-auto mb-4 text-blue-600 dark:text-blue-400" />
                    <h3 className="mb-2 text-xl font-black text-gray-900 md:text-2xl dark:text-white">
                        ¿Tienes dudas sobre los planes?
                    </h3>
                    <p className="mx-auto mb-8 max-w-md text-sm text-gray-600 md:text-base dark:text-gray-400">
                        Nuestro equipo está listo para ayudarte a elegir la mejor opción para tu
                        negocio.
                    </p>
                    <Link
                        href={`/${country}/contacto`}
                        className="inline-block w-full rounded-2xl bg-gray-900 px-10 py-4 text-sm font-black tracking-widest text-white uppercase shadow-xl transition-all hover:bg-blue-600 md:w-auto dark:bg-blue-600 dark:hover:bg-blue-700"
                    >
                        Hablar con Soporte
                    </Link>
                </div>
            </div>
        </section>
    );
}
