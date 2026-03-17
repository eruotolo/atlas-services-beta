import { type NextRequest, NextResponse } from 'next/server';

import { MercadoPagoConfig, Payment } from 'mercadopago';

import { procesarPagoWebhook } from '@/features/payments/actions';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

/**
 * Webhook de Mercado Pago
 * Maneja notificaciones asíncronas de pagos (aprobaciones tardías, pagos en efectivo, etc.)
 */
export async function POST(request: NextRequest) {
    try {
        // 1. Obtener ID de la notificación
        const body = await request.json();
        const { type, data } = body;

        // Solo nos interesan los eventos de pago
        if (type !== 'payment') {
            return NextResponse.json({ received: true }, { status: 200 });
        }

        const paymentId = data.id;

        // 2. Consultar estado real en Mercado Pago (Seguridad)
        // Nunca confiar solo en el body del webhook, siempre verificar con la API
        const client = new MercadoPagoConfig({
            // biome-ignore lint/style/noNonNullAssertion: Variable de entorno requerida
            accessToken: process.env.MP_ACCESS_TOKEN!,
        });
        const paymentClient = new Payment(client);

        const payment = await paymentClient.get({ id: paymentId });

        // 3. Procesar solo si está aprobado
        if (payment.status === 'approved') {
            const { servicio_id, duracion_meses } = payment.metadata;

            if (!servicio_id || !duracion_meses) {
                console.error('⚠️ Pago aprobado pero sin metadata de servicio:', paymentId);
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
        console.error('❌ Error procesando webhook MP:', error);
        // Respondemos 200 para evitar reintentos infinitos de MP si es un error interno nuestro no crítico
        return NextResponse.json({ received: true, error: 'Internal error' }, { status: 200 });
    }
}

// Permitir solo POST
export async function GET() {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
