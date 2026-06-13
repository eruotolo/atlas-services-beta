'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useId, useState, type FormEvent, type ReactElement } from 'react';
import Link from 'next/link';

import { signIn } from 'next-auth/react';

import { AuthShell } from '@/features/auth/components/AuthShell';
import { CheckboxInk } from '@/features/auth/components/CheckboxInk';
import { Btn, Field, Icon, Input, Mono } from '@/shared/components/hireeo';
import { useToast } from '@/shared/components/ui/ToastProvider';

export default function LoginPage(): ReactElement {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [googleLoading, setGoogleLoading] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [keepSession, setKeepSession] = useState<boolean>(true);
    const router = useRouter();
    const searchParams = useSearchParams();
    const params = useParams();
    const country = (params?.country as string) ?? 'cl';
    const callbackUrl = searchParams.get('callbackUrl') || `/${country}/profile`;
    const passwordId = useId();
    const { toast } = useToast();

    function handleProviderComingSoon(name: string): void {
        toast(`${name} estará disponible pronto.`, 'info');
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
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

    async function handleGoogleSignIn(): Promise<void> {
        setGoogleLoading(true);
        setError(null);
        await signIn('google', { callbackUrl });
    }

    return (
        <AuthShell country={country} side="right">
            <div className="mx-auto w-full max-w-[380px]">
                <h1
                    className="m-0 mb-2"
                    style={{
                        fontSize: 30,
                        fontWeight: 500,
                        letterSpacing: '-0.025em',
                        color: 'var(--ink)',
                    }}
                >
                    Bienvenido de vuelta.
                </h1>
                <p
                    className="m-0 mb-8 text-[14px]"
                    style={{ color: 'var(--sub)' }}
                >
                    Iniciá sesión en tu cuenta Hireeo.
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                    {error ? (
                        <div
                            className="rounded-md px-3 py-2 text-[12.5px]"
                            style={{
                                background: 'var(--danger-soft)',
                                color: 'var(--danger)',
                            }}
                        >
                            {error}
                        </div>
                    ) : null}

                    <Field label="Correo">
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

                    <Field label="Contraseña" hint="Mínimo 8 caracteres">
                        <div
                            className="flex items-center gap-2 rounded-md border bg-bg px-3 py-2"
                            style={{ borderColor: 'var(--line)' }}
                        >
                            <Icon name="key" size={14} stroke="var(--muted)" />
                            <input
                                id={passwordId}
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                required
                                placeholder="••••••••••"
                                className="flex-1 bg-transparent text-[13px] outline-none"
                                style={{ color: 'var(--ink)' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                className="inline-flex cursor-pointer"
                                aria-label={
                                    showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                                }
                            >
                                <Icon name="eye" size={14} stroke="var(--muted)" />
                            </button>
                        </div>
                    </Field>

                    <div className="flex items-center justify-between text-[12.5px]">
                        <CheckboxInk
                            label="Mantener sesión"
                            checked={keepSession}
                            onChange={(e) => setKeepSession(e.target.checked)}
                        />
                        <Link
                            href={`/${country}/contact`}
                            className="font-semibold"
                            style={{ color: 'var(--accent)' }}
                        >
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>

                    <Btn
                        type="submit"
                        variant="primary"
                        size="lg"
                        iconRight="arrow"
                        disabled={loading}
                        className="mt-2 w-full justify-center"
                    >
                        {loading ? 'Validando…' : 'Ingresar'}
                    </Btn>

                    <div className="my-1 flex items-center gap-3">
                        <div className="h-px flex-1" style={{ background: 'var(--line)' }} />
                        <Mono
                            className="text-[11px]"
                            style={{ color: 'var(--muted)', letterSpacing: '0.1em' }}
                        >
                            O CON
                        </Mono>
                        <div className="h-px flex-1" style={{ background: 'var(--line)' }} />
                    </div>

                    <Btn
                        type="button"
                        variant="secondary"
                        size="lg"
                        icon="globe"
                        onClick={handleGoogleSignIn}
                        disabled={googleLoading || loading}
                        className="w-full justify-center"
                    >
                        {googleLoading ? 'Conectando…' : 'Google'}
                    </Btn>

                    <Btn
                        type="button"
                        variant="secondary"
                        size="lg"
                        icon="sparkle"
                        onClick={() => handleProviderComingSoon('Apple')}
                        className="w-full justify-center"
                    >
                        Apple
                    </Btn>

                    <Btn
                        type="button"
                        variant="secondary"
                        size="lg"
                        icon="check"
                        onClick={() => handleProviderComingSoon('Microsoft')}
                        className="w-full justify-center"
                    >
                        Microsoft
                    </Btn>
                </form>

                <p
                    className="m-0 mt-7 text-center text-[13px]"
                    style={{ color: 'var(--sub)' }}
                >
                    ¿Primera vez en Hireeo?{' '}
                    <Link
                        href={`/${country}/register`}
                        className="font-semibold"
                        style={{ color: 'var(--ink)' }}
                    >
                        Crear cuenta →
                    </Link>
                </p>
            </div>
        </AuthShell>
    );
}
