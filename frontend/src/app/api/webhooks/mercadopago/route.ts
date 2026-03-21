import { type NextRequest, NextResponse } from 'next/server';

import { MercadoPagoConfig, Payment } from 'mercadopago';

import { procesarPagoWebhook } from '@/features/payments/actions';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

/**
 * Webhook de Mercado Pago multi-país
 * Selecciona el access token según el parámetro ?country=cl|ar|uy
 */
export async function POST(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const countryCode = searchParams.get('country') ?? 'cl';

        const tokenMap: Record<string, string | undefined> = {
            cl: process.env.MP_ACCESS_TOKEN_CL,
            ar: process.env.MP_ACCESS_TOKEN_AR,
            uy: process.env.MP_ACCESS_TOKEN_UY,
        };

        const accessToken = tokenMap[countryCode];
        if (!accessToken) {
            return NextResponse.json({ error: 'País no soportado' }, { status: 400 });
        }

        const body = await request.json();
        const { type, data } = body;

        if (type !== 'payment') {
            return NextResponse.json({ received: true }, { status: 200 });
        }

        const paymentId = data.id;

        const client = new MercadoPagoConfig({ accessToken });
        const paymentClient = new Payment(client);

        const payment = await paymentClient.get({ id: paymentId });

        if (payment.status === 'approved') {
            const { servicio_id, duracion_meses } = payment.metadata;

            if (!servicio_id || !duracion_meses) {
                console.error('Pago aprobado pero sin metadata de servicio:', paymentId);
                return NextResponse.json({ received: true }, { status: 200 });
            }

            await procesarPagoWebhook({
                paymentId: String(paymentId),
                servicioId: String(servicio_id),
                duracionMeses: Number(duracion_meses),
                monto: Number(payment.transaction_amount || 0),
                paymentStatus: payment.status,
            });
        }

        return NextResponse.json({ received: true }, { status: 200 });
    } catch (error) {
        console.error('Error procesando webhook MP:', error);
        return NextResponse.json({ received: true, error: 'Internal error' }, { status: 200 });
    }
}

export async function GET() {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
