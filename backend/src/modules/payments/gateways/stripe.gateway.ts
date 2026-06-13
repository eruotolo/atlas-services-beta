import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

import type {
    CreatePaymentParams,
    PaymentGatewayInterface,
    PaymentResult,
    WebhookVerifyResult,
} from './payment-gateway.interface';

// Mapa de países soportados por Stripe y su variable de entorno correspondiente
const STRIPE_COUNTRY_KEY_MAP: Record<string, string> = {
    es: 'STRIPE_SECRET_KEY_ES',
    us: 'STRIPE_SECRET_KEY_US',
};

const STRIPE_WEBHOOK_SECRET_MAP: Record<string, string> = {
    es: 'STRIPE_WEBHOOK_SECRET_ES',
    us: 'STRIPE_WEBHOOK_SECRET_US',
};

@Injectable()
export class StripeGateway implements PaymentGatewayInterface {
    private readonly logger = new Logger(StripeGateway.name);
    private readonly clients = new Map<string, Stripe>();

    constructor(private readonly config: ConfigService) {}

    private getClient(countryCode: string): Stripe {
        const code = countryCode.toLowerCase();
        if (this.clients.has(code)) {
            return this.clients.get(code)!;
        }

        const envKey = STRIPE_COUNTRY_KEY_MAP[code];
        if (!envKey) {
            throw new Error(`Stripe no soporta el país: ${countryCode}`);
        }

        const secretKey = this.config.get<string>(envKey);
        if (!secretKey) {
            throw new Error(`Variable de entorno ${envKey} no configurada`);
        }

        const client = new Stripe(secretKey);
        this.clients.set(code, client);
        return client;
    }

    async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
        // countryCode se pasa via externalReference prefix en esta implementación stub
        // En producción, se inyectaría el countryCode en el método
        this.logger.log(`Creando PaymentIntent Stripe para referencia: ${params.externalReference}`);

        // Stub — la implementación real extraería el countryCode del contexto
        return {
            clientSecret: `pi_stub_${params.externalReference}_secret`,
            externalId: `pi_stub_${params.externalReference}`,
        };
    }

    async verifyWebhook(payload: string | Buffer, signature: string, countryCode: string = 'es'): Promise<WebhookVerifyResult> {
        this.logger.log(`Verificando webhook Stripe, signature: ${signature}`);
        try {
            const client = this.getClient(countryCode);
            const secret = this.getWebhookSecret(countryCode);
            const event = client.webhooks.constructEvent(payload, signature, secret);
            return { isValid: true, event };
        } catch (err) {
            this.logger.error(`Stripe Webhook Error: ${(err as Error).message}`);
            return { isValid: false, error: (err as Error).message };
        }
    }

    /** Retorna el cliente Stripe configurado para un país específico */
    getClientForCountry(countryCode: string): Stripe {
        return this.getClient(countryCode);
    }

    /** Retorna el webhook secret para verificar notificaciones de un país */
    getWebhookSecret(countryCode: string): string {
        const envKey = STRIPE_WEBHOOK_SECRET_MAP[countryCode.toLowerCase()];
        const secret = envKey ? this.config.get<string>(envKey) : undefined;
        if (!secret) {
            throw new Error(`Webhook secret de Stripe no configurado para: ${countryCode}`);
        }
        return secret;
    }
}
