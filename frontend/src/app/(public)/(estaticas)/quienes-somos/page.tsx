import Image from 'next/image';
import Link from 'next/link';

import { Anchor, ArrowRight, Heart, MapPin, ShieldCheck, TrendingUp } from 'lucide-react';

export default function QuienesSomosPage() {
    return (
        <div className="dark:bg-background min-h-screen bg-white pb-20">
            {/* Hero Section */}
            <section className="relative overflow-hidden px-4 py-24">
                {/* Abstract Background Elements */}
                <div className="absolute top-0 right-0 h-96 w-96 translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-50 opacity-50 blur-3xl dark:bg-blue-950/30" />
                <div className="absolute bottom-0 left-0 h-72 w-72 -translate-x-1/3 translate-y-1/3 rounded-full bg-blue-50 opacity-50 blur-3xl dark:bg-blue-950/30" />

                <div className="relative z-10 mx-auto max-w-4xl text-center">
                    <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-[10px] font-black tracking-widest text-blue-700 uppercase dark:border-blue-900/50 dark:bg-blue-950/50 dark:text-blue-400">
                        <Anchor size={14} /> Desde el Archipiélago
                    </div>
                    <h1 className="mb-8 text-4xl leading-tight font-black tracking-tight text-gray-900 md:text-6xl dark:text-white">
                        Conectando el talento local de{' '}
                        <span className="relative text-blue-600 italic dark:text-blue-400">
                            Chiloé
                            <svg
                                className="absolute -bottom-1 left-0 -z-10 h-3 w-full text-blue-200 dark:text-blue-900/50"
                                viewBox="0 0 100 10"
                                preserveAspectRatio="none"
                            >
                                <title>Chiloé</title>
                                <path
                                    d="M0 5 Q 50 10 100 5"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="none"
                                />
                            </svg>
                        </span>
                    </h1>
                    <p className="mx-auto max-w-2xl text-xl leading-relaxed font-medium text-gray-500 dark:text-gray-400">
                        Nacimos con una misión clara: usar la tecnología para fortalecer los lazos
                        vecinales y potenciar la economía de nuestra isla, un servicio a la vez.
                    </p>
                </div>
            </section>

            {/* Image / Story Split */}
            <section className="mx-auto mb-24 max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="relative aspect-[16/9] overflow-hidden rounded-[2.5rem] shadow-2xl md:aspect-[21/9] dark:shadow-black/20">
                    <Image
                        src="/about.png"
                        alt="Paisaje de Chiloé"
                        fill
                        className="object-cover transition-transform duration-1000 hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 1200px"
                    />
                    {/* Darker Overlay for better contrast */}
                    <div className="absolute inset-0 bg-black/30 transition-opacity dark:bg-black/50" />

                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/90 via-black/30 to-transparent p-8 md:p-16">
                        <div className="max-w-2xl text-white">
                            <span className="mb-4 block text-xs font-black tracking-[0.2em] text-blue-400 uppercase">
                                Nuestra Historia
                            </span>
                            <h3 className="mb-6 text-3xl font-black md:text-5xl">
                                Más que una Aplicación
                            </h3>
                            <p className="text-base leading-relaxed font-medium text-gray-200 opacity-90 md:text-xl">
                                Chiloé Servicios no es una multinacional. Somos un equipo de
                                emprendedores chilotes que entendió que la mejor forma de ayudarnos
                                es sabiendo quién hace qué en nuestra propia comunidad.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Grid */}
            <section className="mx-auto mb-24 max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-16 text-center">
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white">
                        Nuestros Valores
                    </h2>
                    <p className="mt-2 font-medium text-gray-500 dark:text-gray-400">
                        Lo que nos mueve cada día a mejorar la plataforma.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    {[
                        {
                            icon: MapPin,
                            title: 'Identidad Local',
                            desc: 'Entendemos la realidad de la isla. Sabemos lo que cuesta un flete a Quellón o conseguir un eléctrico en Curaco.',
                            color: 'text-blue-600 dark:text-blue-400',
                            bg: 'bg-blue-50 dark:bg-blue-950/30',
                        },
                        {
                            icon: ShieldCheck,
                            title: 'Confianza',
                            desc: 'Validamos identidades y fomentamos las reseñas reales. Queremos que contratar sea seguro y transparente.',
                            color: 'text-green-600 dark:text-green-400',
                            bg: 'bg-green-50 dark:bg-green-950/30',
                        },
                        {
                            icon: Heart,
                            title: 'Comunidad',
                            desc: 'Cada peso pagado por un servicio se queda en la isla. Apoyamos el emprendimiento local y el oficio tradicional.',
                            color: 'text-red-500 dark:text-red-400',
                            bg: 'bg-red-50 dark:bg-red-950/30',
                        },
                    ].map((val) => (
                        <div
                            key={val.title}
                            className="group dark:bg-card rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-sm transition-all hover:shadow-xl hover:shadow-blue-900/5 dark:border-white/10 dark:hover:shadow-black/20"
                        >
                            <div
                                className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl transition-transform group-hover:scale-110 ${val.bg} ${val.color}`}
                            >
                                <val.icon size={32} />
                            </div>
                            <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">
                                {val.title}
                            </h3>
                            <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                                {val.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Team / Stats Section */}
            <section className="mx-auto mb-24 max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="relative overflow-hidden rounded-[3rem] bg-gray-900 py-24 text-white dark:border dark:border-white/10 dark:bg-gray-950">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10">
                        <TrendingUp size={400} strokeWidth={1} />
                    </div>

                    <div className="relative z-10 mx-auto flex max-w-full flex-col items-center justify-between gap-12 px-4 md:flex-row md:px-12">
                        <div className="max-w-xl">
                            <span className="mb-4 block text-xs font-black tracking-[0.2em] text-blue-400 uppercase">
                                Impacto Real
                            </span>
                            <h2 className="mb-6 text-4xl font-black">
                                Creciendo junto a los vecinos
                            </h2>
                            <p className="mb-8 text-lg leading-relaxed text-gray-300">
                                En el último año, hemos ayudado a más de 500 familias a encontrar
                                soluciones rápidas para su hogar, generando ingresos directos para
                                cientos de maestros locales.
                            </p>
                            <div className="flex gap-8">
                                <div>
                                    <p className="text-4xl font-black text-white">2.5k+</p>
                                    <p className="mt-1 text-xs font-bold tracking-widest text-gray-400 uppercase">
                                        Usuarios
                                    </p>
                                </div>
                                <div>
                                    <p className="text-4xl font-black text-white">450+</p>
                                    <p className="mt-1 text-xs font-bold tracking-widest text-gray-400 uppercase">
                                        Proveedores
                                    </p>
                                </div>
                                <div>
                                    <p className="text-4xl font-black text-white">98%</p>
                                    <p className="mt-1 text-xs font-bold tracking-widest text-gray-400 uppercase">
                                        Clientes Felices
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="max-w-sm rounded-3xl border border-white/10 bg-white/10 p-8 backdrop-blur-md">
                            <div className="mb-4 flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-xl font-bold text-white">
                                    E
                                </div>
                                <div>
                                    <p className="font-bold text-white">Equipo ChiloeServicios</p>
                                    <p className="text-xs text-blue-200">Fundadores</p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-300 italic">
                                "Creamos esta plataforma porque nos cansamos de ver avisos perdidos
                                en Facebook. Chiloé necesitaba algo ordenado, moderno y nuestro."
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto">
                    <div className="rounded-[2rem] border border-blue-50 bg-white p-8 text-center shadow-sm md:rounded-3xl md:px-10 md:py-[120px] dark:border-white/10 dark:bg-gray-900/40">
                        <h2 className="mb-8 text-3xl font-black text-gray-900 dark:text-white">
                            ¿Listo para ser parte de la red?
                        </h2>
                        <div className="flex flex-col justify-center gap-4 sm:flex-row">
                            <Link
                                href="/buscar"
                                className="dark:bg-muted dark:hover:bg-muted/80 rounded-2xl border border-gray-200 bg-gray-50 px-8 py-4 font-bold text-gray-900 transition-all hover:bg-gray-100 dark:border-white/10 dark:text-white"
                            >
                                Buscar un Servicio
                            </Link>
                            <Link
                                href="/publicar"
                                className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 font-bold text-white shadow-xl shadow-blue-900/20 transition-all hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                            >
                                Unirme como Proveedor <ArrowRight size={20} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
