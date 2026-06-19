'use client';

import { useCallback, useId, useState, type ReactElement } from 'react';

import { Icon } from '@/shared/components/hireeo';

import { initiateEscrowCheckout } from '../../actions/escrow';

interface CheckoutModalProps {
    open: boolean;
    onClose: () => void;
    quoteId: string;
    price: number;
    /** Descripción opcional de la solicitud de servicio */
    serviceDescription?: string;
    /** Nombre del proveedor */
    providerName?: string;
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0,
    }).format(amount);
}

export function CheckoutModal({
    open,
    onClose,
    quoteId,
    price,
    serviceDescription,
    providerName,
}: CheckoutModalProps): ReactElement | null {
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const titleId = useId();

    const platformFee = Math.round(price * 0.15);
    const providerAmount = price - platformFee;

    const handlePay = useCallback(async () => {
        setLoading(true);
        setErrorMsg(null);

        try {
            const result = await initiateEscrowCheckout(quoteId);

            if ('error' in result) {
                setErrorMsg(result.error);
                setLoading(false);
                return;
            }

            // Redirigir a la URL de pago de Stripe/MercadoPago
            window.location.href = result.paymentUrl;
        } catch {
            setErrorMsg('Ocurrió un error inesperado. Por favor intenta de nuevo.');
            setLoading(false);
        }
    }, [quoteId]);

    const handleClose = useCallback(() => {
        if (loading) return;
        setErrorMsg(null);
        onClose();
    }, [loading, onClose]);

    if (!open) return null;

    return (
        // Overlay
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                backgroundColor: 'rgba(0,0,0,0.55)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget) handleClose();
            }}
        >
            {/* Panel */}
            <div
                style={{
                    width: '100%',
                    maxWidth: '420px',
                    borderRadius: '20px',
                    background: 'var(--bg)',
                    border: '1px solid var(--line)',
                    boxShadow: '0 24px 64px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.10)',
                    overflow: 'hidden',
                    position: 'relative',
                }}
            >
                {/* Barra superior con gradiente sutil */}
                <div
                    style={{
                        height: '4px',
                        background: 'linear-gradient(90deg, var(--accent) 0%, var(--accent-bright) 100%)',
                    }}
                />

                {/* Header */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '20px 24px 16px',
                        borderBottom: '1px solid var(--line)',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                            style={{
                                width: '34px',
                                height: '34px',
                                borderRadius: '10px',
                                background: 'var(--accent-soft)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                            }}
                        >
                            <Icon name="card" size={17} stroke="var(--accent)" />
                        </div>
                        <div>
                            <h2
                                id={titleId}
                                style={{
                                    margin: 0,
                                    fontSize: '15px',
                                    fontWeight: 700,
                                    color: 'var(--ink)',
                                    letterSpacing: '-0.01em',
                                    lineHeight: 1.2,
                                }}
                            >
                                Confirmar pago
                            </h2>
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: '11px',
                                    color: 'var(--muted)',
                                    marginTop: '2px',
                                }}
                            >
                                Pago seguro con escrow
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={loading}
                        aria-label="Cerrar modal"
                        style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '8px',
                            background: 'var(--tint)',
                            border: '1px solid var(--line)',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            opacity: loading ? 0.5 : 1,
                            transition: 'opacity 0.15s',
                        }}
                    >
                        <Icon name="x" size={14} stroke="var(--sub)" />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '20px 24px' }}>
                    {/* Descripción del servicio */}
                    {(serviceDescription ?? providerName) ? (
                        <div
                            style={{
                                borderRadius: '12px',
                                background: 'var(--tint)',
                                border: '1px solid var(--line)',
                                padding: '12px 14px',
                                marginBottom: '20px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px',
                            }}
                        >
                            {providerName ? (
                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: '11px',
                                        color: 'var(--muted)',
                                        fontWeight: 600,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.04em',
                                    }}
                                >
                                    Profesional
                                </p>
                            ) : null}
                            {providerName ? (
                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        color: 'var(--ink)',
                                    }}
                                >
                                    {providerName}
                                </p>
                            ) : null}
                            {serviceDescription ? (
                                <p
                                    style={{
                                        margin: providerName ? '6px 0 0' : 0,
                                        fontSize: '12px',
                                        color: 'var(--sub)',
                                        lineHeight: 1.5,
                                    }}
                                >
                                    {serviceDescription}
                                </p>
                            ) : null}
                        </div>
                    ) : null}

                    {/* Shield info escrow */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '10px',
                            padding: '10px 12px',
                            borderRadius: '10px',
                            background: 'color-mix(in srgb, var(--accent) 6%, var(--bg))',
                            border: '1px solid color-mix(in srgb, var(--accent) 20%, transparent)',
                            marginBottom: '20px',
                        }}
                    >
                        <Icon
                            name="shieldCheck"
                            size={15}
                            stroke="var(--accent)"
                            style={{ flexShrink: 0, marginTop: '1px' }}
                        />
                        <p
                            style={{
                                margin: 0,
                                fontSize: '11.5px',
                                color: 'var(--sub)',
                                lineHeight: 1.5,
                            }}
                        >
                            Tu pago queda protegido en <strong style={{ color: 'var(--ink)' }}>escrow</strong>. El profesional lo recibe solo cuando completes el servicio.
                        </p>
                    </div>

                    {/* Desglose de precio */}
                    <div
                        style={{
                            borderRadius: '12px',
                            border: '1px solid var(--line)',
                            overflow: 'hidden',
                            marginBottom: '20px',
                        }}
                    >
                        {/* Fila total */}
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '13px 16px',
                                background: 'var(--tint)',
                                borderBottom: '1px solid var(--line)',
                            }}
                        >
                            <span
                                style={{
                                    fontSize: '13px',
                                    color: 'var(--sub)',
                                    fontWeight: 500,
                                }}
                            >
                                Total a pagar
                            </span>
                            <span
                                style={{
                                    fontSize: '18px',
                                    fontWeight: 800,
                                    color: 'var(--ink)',
                                    letterSpacing: '-0.02em',
                                    fontVariantNumeric: 'tabular-nums',
                                }}
                            >
                                {formatCurrency(price)}
                            </span>
                        </div>

                        {/* Fila comisión plataforma */}
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '10px 16px',
                                borderBottom: '1px solid var(--line)',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                                    Comisión plataforma
                                </span>
                                <span
                                    style={{
                                        fontSize: '10px',
                                        fontWeight: 600,
                                        color: 'var(--muted)',
                                        background: 'var(--tint)',
                                        border: '1px solid var(--line)',
                                        borderRadius: '4px',
                                        padding: '1px 5px',
                                    }}
                                >
                                    15%
                                </span>
                            </div>
                            <span
                                style={{
                                    fontSize: '13px',
                                    color: 'var(--sub)',
                                    fontVariantNumeric: 'tabular-nums',
                                }}
                            >
                                {formatCurrency(platformFee)}
                            </span>
                        </div>

                        {/* Fila pago al profesional */}
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '10px 16px',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                                    Pago al profesional
                                </span>
                                <span
                                    style={{
                                        fontSize: '10px',
                                        fontWeight: 600,
                                        color: 'var(--muted)',
                                        background: 'var(--tint)',
                                        border: '1px solid var(--line)',
                                        borderRadius: '4px',
                                        padding: '1px 5px',
                                    }}
                                >
                                    85%
                                </span>
                            </div>
                            <span
                                style={{
                                    fontSize: '13px',
                                    color: 'var(--sub)',
                                    fontVariantNumeric: 'tabular-nums',
                                }}
                            >
                                {formatCurrency(providerAmount)}
                            </span>
                        </div>
                    </div>

                    {/* Error */}
                    {errorMsg ? (
                        <div
                            role="alert"
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '8px',
                                padding: '10px 12px',
                                borderRadius: '10px',
                                background: 'color-mix(in srgb, var(--danger) 8%, var(--bg))',
                                border: '1px solid color-mix(in srgb, var(--danger) 25%, transparent)',
                                marginBottom: '16px',
                            }}
                        >
                            <Icon
                                name="alert"
                                size={14}
                                stroke="var(--danger)"
                                style={{ flexShrink: 0, marginTop: '1px' }}
                            />
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: '12px',
                                    color: 'var(--danger)',
                                    lineHeight: 1.5,
                                }}
                            >
                                {errorMsg}
                            </p>
                        </div>
                    ) : null}

                    {/* CTA */}
                    <button
                        type="button"
                        onClick={handlePay}
                        disabled={loading}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '13px 20px',
                            borderRadius: '12px',
                            background: loading
                                ? 'var(--accent-soft)'
                                : 'var(--accent)',
                            border: 'none',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            color: loading ? 'var(--accent)' : 'white',
                            fontSize: '14px',
                            fontWeight: 700,
                            letterSpacing: '-0.01em',
                            transition: 'all 0.15s',
                            opacity: loading ? 0.8 : 1,
                        }}
                    >
                        {loading ? (
                            <>
                                <svg
                                    width="15"
                                    height="15"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    style={{ animation: 'spin 0.8s linear infinite' }}
                                >
                                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                </svg>
                                Procesando...
                            </>
                        ) : (
                            <>
                                <Icon name="card" size={15} stroke="currentColor" />
                                Pagar {formatCurrency(price)}
                            </>
                        )}
                    </button>

                    {/* Nota de seguridad */}
                    <p
                        style={{
                            margin: '12px 0 0',
                            textAlign: 'center',
                            fontSize: '11px',
                            color: 'var(--muted)',
                            lineHeight: 1.5,
                        }}
                    >
                        🔒 Pago procesado de forma segura. Serás redirigido al procesador de pagos.
                    </p>
                </div>
            </div>

            {/* Animación del spinner */}
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
