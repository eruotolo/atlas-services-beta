'use client';

import type React from 'react';
import { useId, useState } from 'react';

import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

import { ArrowLeft, ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { signIn } from 'next-auth/react';

import Logo from '@/shared/components/layout/Logo';

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const params = useParams();
    const country = (params?.country as string) ?? 'cl';
    const callbackUrl = searchParams.get('callbackUrl') || `/${country}/perfil`;
    const emailId = useId();
    const passwordId = useId();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const result = await signIn('credentials', {
            email: formData.get('email'),
            password: formData.get('password'),
            redirect: false,
        });

        if (result?.error) {
            setError('Credenciales inválidas');
            setLoading(false);
        } else {
            router.push(callbackUrl);
            router.refresh();
        }
    }

    return (
        <section className="bg-background flex min-h-[calc(100vh-80px)] items-center justify-center py-12 transition-colors duration-300">
            <div className="container mx-auto flex justify-center px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md">
                    <div className="mb-10 text-center">
                        <div className="mb-6 flex justify-center">
                            <Logo className="h-16 w-auto" />
                        </div>
                        <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                            ¡Qué bueno verte!
                        </h2>
                        <p className="mt-2 font-medium text-gray-500 dark:text-gray-400">
                            Ingresa para gestionar tus avisos o administrar la plataforma.
                        </p>
                    </div>

                    <div className="mb-4">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                        >
                            <ArrowLeft size={16} />
                            Volver al Inicio
                        </Link>
                    </div>

                    <div className="animate-in fade-in slide-in-from-bottom-4 rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-2xl shadow-blue-900/5 duration-500 md:p-10 dark:border-white/10 dark:bg-gray-900/40 dark:shadow-none dark:backdrop-blur-xl">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label
                                        htmlFor={emailId}
                                        className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300"
                                    >
                                        Correo Electrónico
                                    </label>
                                    <div className="relative">
                                        <Mail
                                            className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400 dark:text-gray-600"
                                            size={18}
                                        />
                                        <input
                                            id={emailId}
                                            type="email"
                                            name="email"
                                            required
                                            placeholder="tu@correo.cl"
                                            autoCapitalize="none"
                                            autoCorrect="off"
                                            spellCheck={false}
                                            className="w-full rounded-2xl border border-gray-200 py-3 pr-4 pl-12 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-white/5 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-600"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label
                                        htmlFor={passwordId}
                                        className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300"
                                    >
                                        Contraseña
                                    </label>
                                    <div className="relative">
                                        <Lock
                                            className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400 dark:text-gray-600"
                                            size={18}
                                        />
                                        <input
                                            id={passwordId}
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            required
                                            placeholder="••••••••"
                                            className="w-full rounded-2xl border border-gray-200 py-3 pr-12 pl-12 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-white/5 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-600"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600 focus:outline-none dark:text-gray-500 dark:hover:text-gray-300"
                                        >
                                            {showPassword ? (
                                                <EyeOff size={18} />
                                            ) : (
                                                <Eye size={18} />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 text-lg font-bold text-white shadow-xl shadow-blue-900/10 transition-all hover:bg-blue-700 disabled:opacity-50 dark:shadow-none"
                            >
                                {loading ? (
                                    'Validando...'
                                ) : (
                                    <>
                                        Iniciar Sesión <ArrowRight size={20} />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
                        ¿No tienes cuenta?{' '}
                        <Link
                            href={`/${country}/registro`}
                            className="font-bold text-blue-600 hover:underline dark:text-blue-400"
                        >
                            Regístrate aquí
                        </Link>
                    </p>
                </div>
            </div>
        </section>
    );
}
