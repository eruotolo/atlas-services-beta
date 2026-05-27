import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const { serviceId, durationMonths, amount, currency, countryCode, description } =
            (await request.json()) as {
                serviceId: string;
                durationMonths: number;
                amount: number;
                currency: string;
                countryCode: string;
                description: string;
            };

        if (!serviceId || !durationMonths || !amount) {
            return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
        }

        // Pick the correct Stripe key per country
        const stripeKeyMap: Record<string, string | undefined> = {
            es: process.env.STRIPE_SECRET_KEY_ES,
            us: process.env.STRIPE_SECRET_KEY_US,
        };
        const stripeKey =
            stripeKeyMap[countryCode] ??
            process.env.STRIPE_SECRET_KEY_ES ??
            process.env.STRIPE_SECRET_KEY_US ??
            '';

        if (!stripeKey) {
            return NextResponse.json(
                { error: 'Stripe no configurado para este país' },
                { status: 500 },
            );
        }

        const Stripe = (await import('stripe')).default;
        const stripe = new Stripe(stripeKey);

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: [
                {
                    price_data: {
                        currency: currency.toLowerCase(),
                        product_data: {
                            name: `Hireeo Pro — ${durationMonths} ${durationMonths === 1 ? 'mes' : 'meses'}`,
                            description,
                        },
                        unit_amount: Math.round(amount * 100), // Stripe uses cents
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                serviceId,
                durationMonths: String(durationMonths),
            },
            success_url: `${baseUrl}/${countryCode}/perfil?payment=success`,
            cancel_url: `${baseUrl}/${countryCode}/suscripcion-pro?payment=cancelled`,
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error('Error creando sesión Stripe:', error);
        const message = error instanceof Error ? error.message : 'Error desconocido';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
