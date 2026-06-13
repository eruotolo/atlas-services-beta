'use client';

import { useState, type ReactElement } from 'react';

import { submitQuote } from '@/features/services/actions/leads';

interface QuoteFormProps {
    serviceRequestId: string;
    countryCode: string;
    onSuccess?: () => void;
}

export function QuoteForm({
    serviceRequestId,
    countryCode,
    onSuccess,
}: QuoteFormProps): ReactElement {
    const [price, setPrice] = useState('');
    const [message, setMessage] = useState('');
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sent, setSent] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        const parsedPrice = Number(price);
        if (!parsedPrice || parsedPrice <= 0) {
            setError('Ingresá un precio válido mayor a 0');
            return;
        }
        if (!message.trim() || message.trim().length < 10) {
            setError('El mensaje debe tener al menos 10 caracteres');
            return;
        }

        setPending(true);
        const result = await submitQuote(serviceRequestId, parsedPrice, message.trim(), countryCode);
        setPending(false);

        if (result.success) {
            setSent(true);
            onSuccess?.();
        } else {
            setError(result.error ?? 'Error al enviar la cotización');
        }
    }

    if (sent) {
        return (
            <div
                className="flex items-center gap-2 rounded-xl px-4 py-3 text-[13px] font-semibold"
                style={{ background: 'color-mix(in srgb, var(--success) 10%, var(--bg))', color: 'var(--success)', border: '1px solid color-mix(in srgb, var(--success) 25%, transparent)' }}
            >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                    <path d="M2 7l4 4 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Cotización enviada correctamente
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex gap-3">
                {/* Precio */}
                <div className="flex flex-col gap-1" style={{ width: 140 }}>
                    <label
                        htmlFor={`price-${serviceRequestId}`}
                        className="text-[11px] font-semibold uppercase tracking-wider"
                        style={{ color: 'var(--sub)', letterSpacing: '0.08em' }}
                    >
                        Precio
                    </label>
                    <div className="relative flex items-center">
                        <span
                            className="absolute left-3 text-[13px]"
                            style={{ color: 'var(--sub)' }}
                        >
                            $
                        </span>
                        <input
                            id={`price-${serviceRequestId}`}
                            type="number"
                            min={1}
                            step={1}
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="0"
                            required
                            className="w-full rounded-xl py-2 pl-7 pr-3 text-[13px] font-semibold tabular-nums outline-none transition-all"
                            style={{
                                background: 'var(--tint)',
                                border: '1px solid var(--line)',
                                color: 'var(--ink)',
                            }}
                        />
                    </div>
                </div>

                {/* Mensaje */}
                <div className="flex flex-1 flex-col gap-1">
                    <label
                        htmlFor={`msg-${serviceRequestId}`}
                        className="text-[11px] font-semibold uppercase tracking-wider"
                        style={{ color: 'var(--sub)', letterSpacing: '0.08em' }}
                    >
                        Propuesta
                    </label>
                    <input
                        id={`msg-${serviceRequestId}`}
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Describe brevemente tu propuesta..."
                        required
                        className="w-full rounded-xl px-3 py-2 text-[13px] outline-none transition-all"
                        style={{
                            background: 'var(--tint)',
                            border: '1px solid var(--line)',
                            color: 'var(--ink)',
                        }}
                    />
                </div>
            </div>

            {error ? (
                <p className="text-[12px] font-medium" style={{ color: 'var(--danger)' }}>
                    {error}
                </p>
            ) : null}

            <button
                type="submit"
                disabled={pending}
                className="self-start rounded-xl px-5 py-2 text-[13px] font-semibold text-white transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ background: 'var(--accent)' }}
            >
                {pending ? 'Enviando...' : 'Enviar cotización'}
            </button>
        </form>
    );
}
