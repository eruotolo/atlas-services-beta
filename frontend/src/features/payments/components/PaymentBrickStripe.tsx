'use client';

import { useState } from 'react';

import { AlertCircle, CreditCard, Loader2 } from 'lucide-react';

interface PaymentBrickStripeProps {
    serviceId: string;
    durationMonths: number;
    amount: number;
    currency: string;
    countryCode: string;
    description: string;
}

export function PaymentBrickStripe({
    serviceId,
    durationMonths,
    amount,
    currency,
    countryCode,
    description,
}: PaymentBrickStripeProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCheckout = async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/payments/stripe-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    serviceId,
                    durationMonths,
                    amount,
                    currency,
                    countryCode,
                    description,
                }),
            });

            const data = (await res.json()) as { url?: string; error?: string };

            if (!res.ok || !data.url) {
                setError(data.error || 'Error al crear sesión de pago');
                setLoading(false);
                return;
            }

            window.location.href = data.url;
        } catch {
            setError('Error de conexión. Intenta nuevamente.');
            setLoading(false);
        }
    };

    const formattedAmount = new Intl.NumberFormat(
        countryCode === 'us' ? 'en-US' : 'es-ES',
        { style: 'currency', currency },
    ).format(amount);

    return (
        <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900/40">
            <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400">
                    <CreditCard size={20} />
                </div>
                <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {durationMonths} {durationMonths === 1 ? 'mes' : 'meses'} · Pago único
                    </p>
                </div>
            </div>

            <p className="mb-5 text-center text-3xl font-black text-blue-600 dark:text-blue-400">
                {formattedAmount}
            </p>

            {error && (
                <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                </div>
            )}

            <button
                type="button"
                onClick={() => void handleCheckout()}
                disabled={loading}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-violet-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-900/10 transition-all hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50 dark:shadow-none"
            >
                {loading ? (
                    <>
                        <Loader2 size={16} className="animate-spin" />
                        Redirigiendo a Stripe...
                    </>
                ) : (
                    <>
                        <CreditCard size={16} />
                        Pagar con Stripe
                    </>
                )}
            </button>

            <p className="mt-3 text-center text-[10px] text-gray-400 dark:text-gray-500">
                Serás redirigido a Stripe para completar el pago de forma segura.
            </p>
        </div>
    );
}
