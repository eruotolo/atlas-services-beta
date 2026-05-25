import { Injectable, NotFoundException } from '@nestjs/common';

import { MercadoPagoGateway } from './gateways/mercadopago.gateway';
import { StripeGateway } from './gateways/stripe.gateway';
import type { PaymentGatewayInterface } from './gateways/payment-gateway.interface';

// Países que usan MercadoPago
const MERCADOPAGO_COUNTRIES = new Set(['cl', 'ar', 'uy']);

// Países que usan Stripe
const STRIPE_COUNTRIES = new Set(['es', 'us']);

@Injectable()
export class PaymentsService {
    constructor(
        private readonly mercadoPagoGateway: MercadoPagoGateway,
        private readonly stripeGateway: StripeGateway,
    ) {}

    /**
     * Resuelve el gateway de pago correcto según el código de país.
     * Decisión arquitectónica: el gateway se determina dinámicamente en runtime
     * para soportar expansión a nuevos países sin modificar código central.
     */
    resolveGateway(countryCode: string): PaymentGatewayInterface {
        const code = countryCode.toLowerCase();

        if (MERCADOPAGO_COUNTRIES.has(code)) {
            return this.mercadoPagoGateway;
        }

        if (STRIPE_COUNTRIES.has(code)) {
            return this.stripeGateway;
        }

        throw new NotFoundException(
            `No hay gateway de pago configurado para el país: ${countryCode}`,
        );
    }

    /**
     * Retorna el nombre del gateway para un país dado.
     * Útil para serializar en respuestas API o almacenar en subscriptions.
     */
    resolveGatewayName(countryCode: string): 'MERCADOPAGO' | 'STRIPE' {
        const code = countryCode.toLowerCase();
        if (MERCADOPAGO_COUNTRIES.has(code)) return 'MERCADOPAGO';
        if (STRIPE_COUNTRIES.has(code)) return 'STRIPE';
        throw new NotFoundException(`País no soportado: ${countryCode}`);
    }
}
