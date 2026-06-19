'use client';

import { useRouter } from 'next/navigation';
import { useState, type ReactElement } from 'react';

import { initiateKycSession } from '@/features/users/actions/kyc';
import { Btn, Icon, Mono } from '@/shared/components/hireeo';

export function KycInitiateButton(): ReactElement {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleClick() {
        setError(null);
        setLoading(true);
        try {
            const result = await initiateKycSession();
            if ('error' in result) {
                setError(result.error);
            } else {
                router.push(result.url);
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col items-start gap-3">
            <Btn
                variant="accent"
                size="lg"
                icon="shieldCheck"
                onClick={handleClick}
                disabled={loading}
            >
                {loading ? 'Conectando con Stripe…' : 'Iniciar verificación de identidad'}
            </Btn>
            {loading ? (
                <Mono
                    className="flex items-center gap-1.5 text-[12px]"
                    style={{ color: 'var(--sub)' }}
                >
                    <Icon name="refresh" size={12} stroke="var(--sub)" />
                    Preparando tu sesión segura, no cierres esta ventana…
                </Mono>
            ) : null}
            {error ? (
                <div
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-[13px]"
                    style={{
                        background: 'color-mix(in srgb, var(--danger) 8%, var(--bg))',
                        color: 'var(--danger)',
                        border: '1px solid color-mix(in srgb, var(--danger) 20%, transparent)',
                    }}
                >
                    <Icon name="alert" size={14} stroke="var(--danger)" />
                    {error}
                </div>
            ) : null}
        </div>
    );
}
