'use client';

import { useId, useState } from 'react';

import Link from 'next/link';

import { AlertCircle, CheckCircle, Mail, User } from 'lucide-react';

import { verificarOCrearUsuario } from '@/features/services/publish/actions';

import PhoneInput from '@/shared/components/ui/PhoneInput';

interface Usuario {
    id: string;
    nombre: string;
    email: string;
    telefono?: string | null;
}

interface Paso1DatosUsuarioProps {
    onSuccess: (usuario: Usuario) => void;
}

export default function Paso1DatosUsuario({ onSuccess }: Paso1DatosUsuarioProps) {
    const id = useId();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [debeIniciarSesion, setDebeIniciarSesion] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMensaje('');
        setDebeIniciarSesion(false);

        const formData = new FormData(e.currentTarget);

        try {
            const result = await verificarOCrearUsuario(formData);

            if (result.error) {
                setError(result.error);
                if (result.debeIniciarSesion) {
                    setDebeIniciarSesion(true);
                }
            } else if (result.success && result.usuario) {
                if (result.passwordEnviado) {
                    setMensaje(
                        '¡Cuenta creada! Hemos enviado tu contraseña temporal a tu email. Revisa tu bandeja de entrada.',
                    );
                }

                // Esperar un momento para que el usuario vea el mensaje
                setTimeout(() => {
                    // biome-ignore lint/style/noNonNullAssertion: Usuario validado por success: true
                    onSuccess(result.usuario!);
                }, 1500);
            }
        } catch (_err) {
            setError('Error al procesar la solicitud');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <div className="mb-8 text-center">
                <h2 className="mb-2 text-3xl font-black text-gray-900 dark:text-white">
                    Publica tu Servicio
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Primero, necesitamos tus datos de contacto
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="rounded-2xl border border-red-100 bg-red-50 p-4 dark:border-red-900/30 dark:bg-red-900/20">
                        <div className="mb-3 flex items-start gap-3">
                            <AlertCircle
                                size={20}
                                className="mt-0.5 shrink-0 text-red-600 dark:text-red-400"
                            />
                            <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
                        </div>
                        {debeIniciarSesion && (
                            <Link
                                href="/login?callbackUrl=/publicar"
                                className="block w-full rounded-xl bg-red-600 px-4 py-2 text-center text-sm font-bold text-white transition-colors hover:bg-red-700"
                            >
                                Ir a Iniciar Sesión
                            </Link>
                        )}
                    </div>
                )}

                {mensaje && (
                    <div className="flex items-start gap-3 rounded-2xl border border-green-100 bg-green-50 p-4 text-sm text-green-600 dark:border-green-900/30 dark:bg-green-900/20 dark:text-green-400">
                        <CheckCircle size={20} className="mt-0.5 shrink-0" />
                        <span>{mensaje}</span>
                    </div>
                )}

                <div>
                    <label
                        htmlFor={`${id}-nombre`}
                        className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300"
                    >
                        Nombre Completo
                    </label>
                    <div className="relative">
                        <User
                            size={18}
                            className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400 dark:text-gray-600"
                        />
                        <input
                            type="text"
                            id={`${id}-nombre`}
                            name="nombre"
                            required
                            placeholder="Juan Pérez"
                            className="w-full rounded-2xl border border-gray-200 py-3 pr-4 pl-12 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-white/5 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-600"
                        />
                    </div>
                </div>

                <div>
                    <label
                        htmlFor={`${id}-email`}
                        className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300"
                    >
                        Correo Electrónico
                    </label>
                    <div className="relative">
                        <Mail
                            size={18}
                            className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400 dark:text-gray-600"
                        />
                        <input
                            type="email"
                            id={`${id}-email`}
                            name="email"
                            required
                            placeholder="tu@email.com"
                            autoCapitalize="none"
                            autoCorrect="off"
                            spellCheck={false}
                            className="w-full rounded-2xl border border-gray-200 py-3 pr-4 pl-12 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-white/5 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-600"
                        />
                    </div>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                        Si no tienes cuenta, te crearemos una y enviaremos tu contraseña a este
                        email
                    </p>
                </div>

                <PhoneInput id={`${id}-telefono`} name="telefono" label="Teléfono" required />

                <div className="flex items-start gap-3">
                    <input
                        type="checkbox"
                        id={`${id}-terminos`}
                        name="terminos"
                        required
                        className="mt-1 h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
                    />
                    <label
                        htmlFor={`${id}-terminos`}
                        className="text-sm text-gray-600 dark:text-gray-400"
                    >
                        Acepto los{' '}
                        <Link
                            href="/terminos"
                            target="_blank"
                            className="font-bold text-blue-600 hover:underline dark:text-blue-400"
                        >
                            Términos y Condiciones
                        </Link>{' '}
                        y la{' '}
                        <Link
                            href="/privacidad"
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
                    disabled={loading}
                    className="w-full cursor-pointer rounded-2xl bg-blue-600 px-6 py-4 font-bold text-white shadow-lg shadow-blue-200 transition-colors hover:bg-blue-700 disabled:opacity-50 dark:shadow-none"
                >
                    {loading ? 'Verificando...' : 'Continuar al Siguiente Paso'}
                </button>

                <p className="text-center text-xs text-gray-500 dark:text-gray-500">
                    Al continuar, aceptas que crearemos una cuenta para ti si aún no tienes una
                </p>
            </form>
        </div>
    );
}
