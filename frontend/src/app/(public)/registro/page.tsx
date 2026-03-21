'use client';

import { useActionState, useId, useState } from 'react';

import Link from 'next/link';
import { useParams } from 'next/navigation';

import { ArrowLeft, ArrowRight, Eye, EyeOff, Lock, Mail, User } from 'lucide-react';

import { registerAction } from '@/features/auth/actions';

import Logo from '@/shared/components/layout/Logo';
import PhoneInput from '@/shared/components/ui/PhoneInput';

// Tipo estricto para el estado del formulario
interface RegisterState {
    error?: {
        general?: string[];
        nombre?: string[];
        telefono?: string[];
        email?: string[];
        password?: string[];
    };
}

export default function RegistroPage() {
    const params = useParams();
    const country = (params?.country as string) ?? 'cl';
    const [showPassword, setShowPassword] = useState(false);

    const ids = {
        nombre: useId(),
        telefono: useId(),
        email: useId(),
        password: useId(),
        terminos: useId(),
    };

    const [state, formAction, isPending] = useActionState<RegisterState, FormData>(
        registerAction,
        {},
    );

    const errors = state?.error || {};

    // Helper para campos de texto para reducir complejidad del JSX
    const renderInput = (
        name: keyof NonNullable<RegisterState['error']>,
        label: string,
        type: string,
        placeholder: string,
        Icon: React.ComponentType<{ size?: number; className?: string }>,
    ) => {
        const fieldError = errors[name];
        const hasError = !!fieldError;

        return (
            <div>
                <label
                    htmlFor={ids[name as keyof typeof ids]}
                    className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300"
                >
                    {label}
                </label>
                <div className="relative">
                    <Icon
                        className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400 dark:text-gray-600"
                        size={18}
                    />
                    <input
                        id={ids[name as keyof typeof ids]}
                        type={name === 'password' && showPassword ? 'text' : type}
                        name={name}
                        required
                        placeholder={placeholder}
                        autoCapitalize={name === 'email' ? 'none' : undefined}
                        autoCorrect={name === 'email' ? 'off' : undefined}
                        spellCheck={name === 'email' ? false : undefined}
                        className={`w-full rounded-2xl border border-gray-200 py-3 pr-4 pl-12 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-white/5 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-600 ${
                            hasError
                                ? 'border-red-500 dark:border-red-500'
                                : 'border-gray-200 dark:border-white/5'
                        }`}
                    />
                    {name === 'password' && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600 focus:outline-none dark:text-gray-500 dark:hover:text-gray-300"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    )}
                </div>
                {hasError && (
                    <p className="mt-1 px-1 text-xs text-red-600 dark:text-red-400">
                        {fieldError?.[0]}
                    </p>
                )}
            </div>
        );
    };

    return (
        <section className="bg-background flex min-h-[calc(100vh-80px)] items-center justify-center py-12 transition-colors duration-300">
            <div className="container mx-auto flex justify-center px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md">
                    <div className="mb-10 text-center">
                        <div className="mb-6 flex justify-center">
                            <Logo className="h-16 w-auto" />
                        </div>
                        <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                            Crear Cuenta
                        </h2>
                        <p className="mt-2 font-medium text-gray-500 dark:text-gray-400">
                            Crea tu cuenta en Atlas Servicios
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
                        <form action={formAction} className="space-y-6">
                            {errors.general && (
                                <div className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-600 dark:bg-red-900/20 dark:text-red-400">
                                    {errors.general[0]}
                                </div>
                            )}

                            <div className="space-y-4">
                                {renderInput(
                                    'nombre',
                                    'Nombre Completo',
                                    'text',
                                    'Juan Pérez',
                                    User,
                                )}
                                <PhoneInput
                                    id={ids.telefono}
                                    name="telefono"
                                    label="Teléfono / WhatsApp"
                                    error={errors.telefono?.[0]}
                                    required
                                />
                                {renderInput(
                                    'email',
                                    'Correo Electrónico',
                                    'email',
                                    'tu@correo.cl',
                                    Mail,
                                )}
                                {renderInput(
                                    'password',
                                    'Contraseña',
                                    'password',
                                    '••••••••',
                                    Lock,
                                )}
                            </div>

                            <div className="flex items-start gap-3 px-1">
                                <input
                                    type="checkbox"
                                    id={ids.terminos}
                                    name="terminos"
                                    required
                                    className="mt-1 h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
                                />
                                <label
                                    htmlFor={ids.terminos}
                                    className="text-sm text-gray-500 dark:text-gray-400"
                                >
                                    Acepto los{' '}
                                    <Link
                                        href={`/${country}/terminos`}
                                        target="_blank"
                                        className="font-bold text-blue-600 hover:underline dark:text-blue-400"
                                    >
                                        Términos y Condiciones
                                    </Link>{' '}
                                    y la{' '}
                                    <Link
                                        href={`/${country}/privacidad`}
                                        target="_blank"
                                        className="font-bold text-blue-600 hover:underline dark:text-blue-400"
                                    >
                                        Política de Privacidad
                                    </Link>
                                    .
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={isPending}
                                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 text-lg font-bold text-white shadow-xl shadow-blue-900/10 transition-all hover:bg-blue-700 disabled:opacity-50 dark:shadow-none"
                            >
                                {isPending ? (
                                    'Creando cuenta...'
                                ) : (
                                    <>
                                        Crear Cuenta <ArrowRight size={20} />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
                        ¿Ya tienes cuenta?{' '}
                        <Link
                            href={`/${country}/login`}
                            className="font-bold text-blue-600 hover:underline dark:text-blue-400"
                        >
                            Inicia sesión
                        </Link>
                    </p>
                </div>
            </div>
        </section>
    );
}
