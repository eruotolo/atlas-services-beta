import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
        return NextResponse.json({ error: 'Sin firma Stripe' }, { status: 400 });
    }

    const Stripe = (await import('stripe')).default;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
        return NextResponse.json({ error: 'Webhook secret no configurado' }, { status: 500 });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY_ES ?? process.env.STRIPE_SECRET_KEY_US ?? '';
    const stripe = new Stripe(stripeKey);

    let event: import('stripe').Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Error de verificación';
        return NextResponse.json({ error: message }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as import('stripe').Stripe.Checkout.Session;
        const { serviceId, durationMonths } = session.metadata ?? {};

        if (serviceId && durationMonths) {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            await fetch(`${apiUrl}/subscriptions/activate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    serviceId,
                    durationMonths: Number(durationMonths),
                    transactionId: session.id,
                    paymentGateway: 'STRIPE',
                }),
            });
        }
    }

    return NextResponse.json({ received: true });
}
