'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useActionState, useId, useState, type ReactElement } from 'react';

import { registerAction } from '@/features/auth/actions';
import { AuthShell } from '@/features/auth/components/AuthShell';
import { Btn, Field, Icon, Input, Mono } from '@/shared/components/hireeo';
import { CheckboxInk } from '@/features/auth/components/CheckboxInk';
import PhoneInput from '@/shared/components/ui/PhoneInput';

interface RegisterState {
    error?: {
        general?: string[];
        nombre?: string[];
        telefono?: string[];
        email?: string[];
        password?: string[];
    };
}

export default function RegistroPage(): ReactElement {
    const params = useParams();
    const country = (params?.country as string) ?? 'cl';
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [state, formAction, isPending] = useActionState<RegisterState, FormData>(
        registerAction,
        {},
    );
    const passwordId = useId();

    const errors = state?.error || {};

    return (
        <AuthShell country={country} side="left">
            <div className="mx-auto w-full max-w-[420px]">
                <Mono
                    className="text-[11px] font-semibold"
                    style={{ color: 'var(--accent)', letterSpacing: '0.15em' }}
                >
                    — CREAR CUENTA
                </Mono>
                <h1
                    className="m-0 mt-3 mb-2"
                    style={{
                        fontSize: 30,
                        fontWeight: 500,
                        letterSpacing: '-0.025em',
                        color: 'var(--ink)',
                    }}
                >
                    Empezá en Hireeo.
                </h1>
                <p
                    className="m-0 mb-7 text-[14px]"
                    style={{ color: 'var(--sub)' }}
                >
                    Sin tarjeta, sin compromiso. Verificación en 24 horas.
                </p>

                <form action={formAction} className="flex flex-col gap-3">
                    {errors.general ? (
                        <div
                            className="rounded-md px-3 py-2 text-[12.5px] font-semibold"
                            style={{
                                background: 'var(--danger-soft)',
                                color: 'var(--danger)',
                            }}
                        >
                            {errors.general[0]}
                        </div>
                    ) : null}

                    <Field label="Nombre completo" error={errors.nombre?.[0]}>
                        <Input
                            icon="user"
                            type="text"
                            name="nombre"
                            required
                            placeholder="Juan Pérez"
                        />
                    </Field>

                    <PhoneInput
                        name="telefono"
                        label="Teléfono / WhatsApp"
                        error={errors.telefono?.[0]}
                        required
                    />

                    <Field label="Correo" error={errors.email?.[0]}>
                        <Input
                            icon="mail"
                            type="email"
                            name="email"
                            required
                            placeholder="tu@correo.com"
                            autoCapitalize="none"
                            autoCorrect="off"
                            spellCheck={false}
                        />
                    </Field>

                    <Field
                        label="Contraseña"
                        hint="Mín. 8 caracteres, una mayúscula, un número"
                        error={errors.password?.[0]}
                    >
                        <Input
                            id={passwordId}
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            required
                            placeholder="••••••••••"
                            icon="key"
                            suffix={
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    aria-label={
                                        showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                                    }
                                    className="inline-flex cursor-pointer"
                                >
                                    <Icon name="eye" size={14} stroke="var(--muted)" />
                                </button>
                            }
                        />
                    </Field>

                    <CheckboxInk
                        name="terminos"
                        required
                        size="md"
                        className="mt-2"
                        label={
                            <>
                                Acepto los{' '}
                                <Link
                                    href={`/${country}/terms`}
                                    target="_blank"
                                    className="font-semibold underline"
                                    style={{ color: 'var(--ink)' }}
                                >
                                    Términos
                                </Link>{' '}
                                y la{' '}
                                <Link
                                    href={`/${country}/privacy`}
                                    target="_blank"
                                    className="font-semibold underline"
                                    style={{ color: 'var(--ink)' }}
                                >
                                    Política de Privacidad
                                </Link>
                                . Entiendo que mis datos se procesan en LATAM.
                            </>
                        }
                    />


                    <Btn
                        type="submit"
                        variant="primary"
                        size="lg"
                        iconRight="arrow"
                        disabled={isPending}
                        className="mt-3 w-full justify-center"
                    >
                        {isPending ? 'Creando cuenta…' : 'Crear cuenta'}
                    </Btn>
                </form>

                <p
                    className="m-0 mt-6 text-center text-[13px]"
                    style={{ color: 'var(--sub)' }}
                >
                    ¿Ya tenés cuenta?{' '}
                    <Link
                        href={`/${country}/login`}
                        className="font-semibold"
                        style={{ color: 'var(--ink)' }}
                    >
                        Ingresar →
                    </Link>
                </p>
            </div>
        </AuthShell>
    );
}
