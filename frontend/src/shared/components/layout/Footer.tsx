'use client';

import type React from 'react';

import Link from 'next/link';
import { useParams } from 'next/navigation';

import { FaHeart, FaInstagram, FaWhatsapp, FaYoutube } from 'react-icons/fa';

import Logo from './Logo';

const Footer: React.FC = () => {
    const params = useParams();
    const country = (params?.country as string) ?? 'cl';

    return (
        <footer className="border-border bg-background border-t pt-16 pb-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-4">
                    <div className="col-span-1 md:col-span-1">
                        <div className="mb-6 opacity-80 transition-opacity hover:opacity-100">
                            <Logo className="h-10 w-auto" />
                        </div>
                        <p className="pr-4 text-sm leading-relaxed text-gray-600 dark:text-gray-500">
                            Conectamos profesionales locales con quienes necesitan sus servicios.
                            Encuentra expertos verificados cerca de ti.
                        </p>

                        <div className="mt-6 flex gap-4">
                            <a
                                href="https://www.instagram.com/atlasservicios/"
                                className="text-gray-400 transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                                target="_blank"
                                rel="noopener"
                            >
                                <FaInstagram size={20} />
                            </a>
                            <a
                                href="https://wa.me/56929540906?text=Hola,%20que%20tal?"
                                className="text-gray-400 transition-colors hover:text-green-600 dark:hover:text-green-400"
                                aria-label="WhatsApp"
                                target="_blank"
                                rel="noopener"
                            >
                                <FaWhatsapp size={20} />
                            </a>
                            <a
                                href="https://www.youtube.com/@AtlasServicios"
                                className="text-gray-400 transition-colors hover:text-red-600 dark:hover:text-red-400"
                                aria-label="YouTube"
                                target="_blank"
                                rel="noopener"
                            >
                                <FaYoutube size={20} />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 className="mb-6 text-xs font-bold tracking-widest text-blue-600 text-gray-900 uppercase dark:text-gray-100">
                            Plataforma
                        </h4>
                        <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-500">
                            <li>
                                <Link
                                    href={`/${country}/quienes-somos`}
                                    className="font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                                >
                                    Quiénes somos
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={`/${country}/como-funciona`}
                                    className="font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                                >
                                    ¿Cómo funciona?
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={`/${country}/publicar`}
                                    className="font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                                >
                                    Publicar un servicio
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={`/${country}/suscripcion-pro`}
                                    className="font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                                >
                                    Suscripciones Pro
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="mb-6 text-xs font-bold tracking-widest text-blue-600 text-gray-900 uppercase dark:text-gray-100">
                            Soporte
                        </h4>
                        <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-500">
                            <li>
                                <Link
                                    href={`/${country}/ayuda`}
                                    className="font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                                >
                                    Centro de ayuda
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={`/${country}/terminos`}
                                    className="font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                                >
                                    Términos legales
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={`/${country}/privacidad`}
                                    className="font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                                >
                                    Privacidad
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={`/${country}/contacto`}
                                    className="font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                                >
                                    Contacto
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className="border-border bg-muted rounded-[2rem] border p-6">
                        <h4 className="mb-4 text-sm font-bold text-blue-900 italic dark:text-blue-300">
                            ¿Eres profesional independiente?
                        </h4>
                        <p className="mb-4 text-xs leading-relaxed text-blue-700 dark:text-blue-400">
                            Publica tus servicios y llega a más clientes en tu zona. Registro
                            gratuito.
                        </p>
                        <Link
                            href={`/${country}/publicar`}
                            className="text-[10px] font-black tracking-tighter text-blue-600 uppercase hover:underline dark:text-blue-400"
                        >
                            Publicar mi servicio →
                        </Link>
                    </div>
                </div>

                <div className="border-border flex flex-col items-center justify-between border-t pt-8 text-[10px] font-bold tracking-widest text-gray-500 uppercase md:flex-row dark:text-gray-600">
                    <p>
                        Todos los derechos reservados © 2026{' '}
                        <a
                            href="https://crowadvance.com/"
                            target="_blank"
                            rel="noopener"
                            className="hover:text-blue-600 dark:hover:text-blue-400"
                        >
                            Crow Advance
                        </a>
                    </p>
                    <p className="mt-4 flex items-center gap-1 md:mt-0">
                        Hecho con{' '}
                        <FaHeart size={14} className="animate-pulse fill-red-500 text-red-500" /> en
                        América
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
