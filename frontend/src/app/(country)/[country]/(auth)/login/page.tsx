'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useId, useState, type FormEvent, type ReactElement } from 'react';
import Link from 'next/link';

import { getSession, signIn } from 'next-auth/react';

import { AuthShell } from '@/features/auth/components/AuthShell';
import { CheckboxInk } from '@/features/auth/components/CheckboxInk';
import { AppleIcon, GoogleIcon, MicrosoftIcon } from '@/features/auth/components/OAuthBrandIcons';
import { Btn, Field, Icon, Input, Mono } from '@/shared/components/hireeo';

export default function LoginPage(): ReactElement {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [googleLoading, setGoogleLoading] = useState<boolean>(false);
    const [appleLoading, setAppleLoading] = useState<boolean>(false);
    const [microsoftLoading, setMicrosoftLoading] = useState<boolean>(false);
    const [oauthError, setOauthError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [keepSession, setKeepSession] = useState<boolean>(true);
    const router = useRouter();
    const searchParams = useSearchParams();
    const params = useParams();
    const country = (params?.country as string) ?? 'cl';
    const callbackUrl = searchParams.get('callbackUrl') || `/${country}/profile`;
    const passwordId = useId();

    const anyProviderLoading = googleLoading || appleLoading || microsoftLoading;

    // Leer el error de NextAuth que puede venir como query param (?error=...)
    const nextAuthError = searchParams.get('error');
    const resolvedOauthError = oauthError ??
        (nextAuthError ? 'Hubo un problema al iniciar sesión con el proveedor seleccionado. Intenta nuevamente.' : null);

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
            const session = await getSession();
            const roles = session?.user?.roles ?? [];
            const hasExplicitCallback = searchParams.get('callbackUrl') !== null;

            if (!hasExplicitCallback && roles.includes('SuperAdministrador')) {
                router.push('/config');
            } else {
                router.push(callbackUrl);
            }
            router.refresh();
        }
    }

    async function handleGoogleSignIn(): Promise<void> {
        setGoogleLoading(true);
        setError(null);
        setOauthError(null);
        try {
            await signIn('google', { callbackUrl });
        } catch {
            setOauthError('No se pudo conectar con Google. Intenta nuevamente.');
        } finally {
            setGoogleLoading(false);
        }
    }

    async function handleAppleSignIn(): Promise<void> {
        setAppleLoading(true);
        setError(null);
        setOauthError(null);
        try {
            await signIn('apple', { callbackUrl });
        } catch {
            setOauthError('No se pudo conectar con Apple. Intenta nuevamente.');
        } finally {
            setAppleLoading(false);
        }
    }

    async function handleMicrosoftSignIn(): Promise<void> {
        setMicrosoftLoading(true);
        setError(null);
        setOauthError(null);
        try {
            await signIn('azure-ad', { callbackUrl });
        } catch {
            setOauthError('No se pudo conectar con Microsoft. Intenta nuevamente.');
        } finally {
            setMicrosoftLoading(false);
        }
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
                                    className="inline-flex cursor-pointer"
                                    aria-label={
                                        showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                                    }
                                >
                                    <Icon name="eye" size={14} stroke="var(--muted)" />
                                </button>
                            }
                        />
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
                        onClick={handleGoogleSignIn}
                        disabled={googleLoading || loading || anyProviderLoading}
                        className="w-full justify-center"
                    >
                        <GoogleIcon size={16} />
                        {googleLoading ? 'Conectando…' : 'Google'}
                    </Btn>

                    <Btn
                        type="button"
                        variant="secondary"
                        size="lg"
                        onClick={handleAppleSignIn}
                        disabled={appleLoading || loading || anyProviderLoading}
                        className="w-full justify-center"
                    >
                        <AppleIcon size={16} />
                        {appleLoading ? 'Conectando…' : 'Apple'}
                    </Btn>

                    <Btn
                        type="button"
                        variant="secondary"
                        size="lg"
                        onClick={handleMicrosoftSignIn}
                        disabled={microsoftLoading || loading || anyProviderLoading}
                        className="w-full justify-center"
                    >
                        <MicrosoftIcon size={16} />
                        {microsoftLoading ? 'Conectando…' : 'Microsoft'}
                    </Btn>

                    {resolvedOauthError ? (
                        <div
                            className="rounded-md px-3 py-2 text-[12.5px]"
                            style={{
                                background: 'var(--danger-soft)',
                                color: 'var(--danger)',
                            }}
                        >
                            {resolvedOauthError}
                        </div>
                    ) : null}
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
