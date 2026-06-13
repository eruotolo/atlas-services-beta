'use client';

import { useRouter } from 'next/navigation';
import { useState, type ReactElement } from 'react';

import { initiateKycSession } from '@/features/users/actions/kyc';
import { Btn, Icon, Mono, Pill } from '@/shared/components/hireeo';

interface KycStatusBannerProps {
    isVerified: boolean;
    verifiedAt?: string | null;
}

function formatDate(dateStr: string): string {
    try {
        return new Intl.DateTimeFormat('es-AR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        }).format(new Date(dateStr));
    } catch {
        return dateStr;
    }
}

export function KycStatusBanner({ isVerified, verifiedAt }: KycStatusBannerProps): ReactElement {
    const router = useRouter();
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleVerify() {
        setErrorMsg(null);
        setLoading(true);
        try {
            const result = await initiateKycSession();
            if ('error' in result) {
                setErrorMsg(result.error);
            } else {
                router.push(result.url);
            }
        } finally {
            setLoading(false);
        }
    }

    // ── Verificado ────────────────────────────────────────────────────────────
    if (isVerified) {
        return (
            <div
                className="flex items-center gap-4 rounded-[14px] border"
                style={{
                    padding: '18px 22px',
                    background: 'color-mix(in srgb, var(--success) 8%, var(--bg))',
                    borderColor: 'color-mix(in srgb, var(--success) 30%, transparent)',
                }}
            >
                <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                    style={{ background: 'color-mix(in srgb, var(--success) 15%, transparent)' }}
                >
                    <Icon name="shieldCheck" size={20} stroke="var(--success)" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <span
                            className="text-[14px] font-semibold"
                            style={{ color: 'var(--ink)' }}
                        >
                            Identidad Verificada
                        </span>
                        <Pill tone="success" icon="check">
                            VERIFICADO
                        </Pill>
                    </div>
                    {verifiedAt ? (
                        <Mono
                            className="mt-0.5 text-[11px]"
                            style={{ color: 'var(--sub)' }}
                        >
                            Verificado el {formatDate(verifiedAt)}
                        </Mono>
                    ) : null}
                </div>
            </div>
        );
    }

    // ── Pendiente ─────────────────────────────────────────────────────────────
    return (
        <div
            className="rounded-[14px] border"
            style={{
                padding: '18px 22px',
                background: 'color-mix(in srgb, var(--warning) 6%, var(--bg))',
                borderColor: 'color-mix(in srgb, var(--warning) 25%, transparent)',
            }}
        >
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div
                        className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                        style={{
                            background: 'color-mix(in srgb, var(--warning) 12%, transparent)',
                        }}
                    >
                        <Icon name="shield" size={18} stroke="var(--warning)" />
                    </div>
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span
                                className="text-[14px] font-semibold"
                                style={{ color: 'var(--ink)' }}
                            >
                                Verificación pendiente
                            </span>
                            <Pill tone="warning">PENDIENTE</Pill>
                        </div>
                        <p
                            className="mt-1 text-[13px] leading-relaxed"
                            style={{ color: 'var(--sub)' }}
                        >
                            Verificá tu identidad para generar más confianza y acceder a más clientes.
                        </p>
                    </div>
                </div>
                <Btn
                    variant="secondary"
                    size="sm"
                    icon="shieldCheck"
                    onClick={handleVerify}
                    disabled={loading}
                >
                    {loading ? 'Iniciando…' : 'Verificar identidad'}
                </Btn>
            </div>
            {errorMsg ? (
                <div
                    className="mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-[12px]"
                    style={{
                        background: 'color-mix(in srgb, var(--danger) 8%, var(--bg))',
                        color: 'var(--danger)',
                        border: '1px solid color-mix(in srgb, var(--danger) 20%, transparent)',
                    }}
                >
                    <Icon name="alert" size={13} stroke="var(--danger)" />
                    {errorMsg}
                </div>
            ) : null}
        </div>
    );
}
