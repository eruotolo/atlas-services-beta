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
                <h2 className="mb-2 text-3xl font-black text-ink">
                    Publica tu Servicio
                </h2>
                <p className="text-sub">
                    Primero, necesitamos tus datos de contacto
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
                        <div className="mb-3 flex items-start gap-3">
                            <AlertCircle
                                size={20}
                                className="mt-0.5 shrink-0 text-red-600"
                            />
                            <span className="text-sm text-red-600">{error}</span>
                        </div>
                        {debeIniciarSesion && (
                            <Link
                                href="/login?callbackUrl=/publish"
                                className="block w-full rounded-xl bg-red-600 px-4 py-2 text-center text-sm font-bold text-white transition-colors hover:bg-red-700"
                            >
                                Ir a Iniciar Sesión
                            </Link>
                        )}
                    </div>
                )}

                {mensaje && (
                    <div className="flex items-start gap-3 rounded-2xl border border-green-100 bg-green-50 p-4 text-sm text-green-600">
                        <CheckCircle size={20} className="mt-0.5 shrink-0" />
                        <span>{mensaje}</span>
                    </div>
                )}

                <div>
                    <label
                        htmlFor={`${id}-nombre`}
                        className="mb-2 block text-sm font-bold text-sub"
                    >
                        Nombre Completo
                    </label>
                    <div className="relative">
                        <User
                            size={18}
                            className="absolute top-1/2 left-4 -translate-y-1/2 text-muted"
                        />
                        <input
                            type="text"
                            id={`${id}-nombre`}
                            name="nombre"
                            required
                            placeholder="Juan Pérez"
                            className="w-full rounded-2xl border border-line py-3 pr-4 pl-12 text-ink focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none"
                        />
                    </div>
                </div>

                <div>
                    <label
                        htmlFor={`${id}-email`}
                        className="mb-2 block text-sm font-bold text-sub"
                    >
                        Correo Electrónico
                    </label>
                    <div className="relative">
                        <Mail
                            size={18}
                            className="absolute top-1/2 left-4 -translate-y-1/2 text-muted"
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
                            className="w-full rounded-2xl border border-line py-3 pr-4 pl-12 text-ink focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none"
                        />
                    </div>
                    <p className="mt-2 text-xs text-muted">
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
                        className="mt-1 h-4 w-4 cursor-pointer rounded border-line text-brand focus:ring-brand"
                    />
                    <label
                        htmlFor={`${id}-terminos`}
                        className="text-sm text-sub"
                    >
                        Acepto los{' '}
                        <Link
                            href="/terms"
                            target="_blank"
                            className="font-bold text-brand hover:underline"
                        >
                            Términos y Condiciones
                        </Link>{' '}
                        y la{' '}
                        <Link
                            href="/privacy"
                            target="_blank"
                            className="font-bold text-brand hover:underline"
                        >
                            Política de Privacidad
                        </Link>
                        .
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full cursor-pointer rounded-2xl px-6 py-4 disabled:opacity-50"
                >
                    {loading ? 'Verificando...' : 'Continuar al Siguiente Paso'}
                </button>

                <p className="text-center text-xs text-muted">
                    Al continuar, aceptas que crearemos una cuenta para ti si aún no tienes una
                </p>
            </form>
        </div>
    );
}
