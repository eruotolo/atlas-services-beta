'use client';

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
    const handleCheckout = async () => {
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
        const data = (await res.json()) as { url?: string };
        if (data.url) window.location.href = data.url;
    };

    return (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-gray-200 bg-white p-6">
            <p className="text-lg font-semibold text-gray-800">{description}</p>
            <p className="text-2xl font-bold text-blue-600">
                {new Intl.NumberFormat(countryCode === 'us' ? 'en-US' : 'es-ES', {
                    style: 'currency',
                    currency,
                }).format(amount)}
            </p>
            <button
                type="button"
                onClick={() => void handleCheckout()}
                className="w-full rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white hover:bg-blue-600"
            >
                Pagar con Stripe
            </button>
        </div>
    );
}
