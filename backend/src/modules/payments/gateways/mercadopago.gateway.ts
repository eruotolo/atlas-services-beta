import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

import type {
    CreatePaymentParams,
    PaymentGatewayInterface,
    PaymentResult,
    WebhookVerifyResult,
} from './payment-gateway.interface';

// Mapa de países soportados por MercadoPago y su variable de entorno correspondiente
const MP_COUNTRY_TOKEN_MAP: Record<string, string> = {
    cl: 'MP_ACCESS_TOKEN_CL',
    ar: 'MP_ACCESS_TOKEN_AR',
    uy: 'MP_ACCESS_TOKEN_UY',
};

const MP_WEBHOOK_SECRET_MAP: Record<string, string> = {
    cl: 'MP_WEBHOOK_SECRET_CL',
    ar: 'MP_WEBHOOK_SECRET_AR',
    uy: 'MP_WEBHOOK_SECRET_UY',
};

@Injectable()
export class MercadoPagoGateway implements PaymentGatewayInterface {
    private readonly logger = new Logger(MercadoPagoGateway.name);

    constructor(private readonly config: ConfigService) {}

    private getAccessToken(countryCode: string): string {
        const envKey = MP_COUNTRY_TOKEN_MAP[countryCode.toLowerCase()];
        if (!envKey) {
            throw new Error(`MercadoPago no soporta el país: ${countryCode}`);
        }
        const token = this.config.get<string>(envKey);
        if (!token) {
            throw new Error(`Variable de entorno ${envKey} no configurada`);
        }
        return token;
    }

    private getWebhookSecret(countryCode: string): string {
        const envKey = MP_WEBHOOK_SECRET_MAP[countryCode.toLowerCase()];
        const secret = envKey ? this.config.get<string>(envKey) : undefined;
        if (!secret) {
            throw new Error(`Webhook secret de MercadoPago no configurado para: ${countryCode}`);
        }
        return secret;
    }

    async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
        // En producción se usaría el SDK oficial de MercadoPago
        // Este método está preparado para integrarse con @mercadopago/sdk-node
        this.logger.log(`Creando preferencia MercadoPago para referencia: ${params.externalReference}`);

        // Stub preparado para integración real — la implementación real
        // llamaría a preference.create({ body: { ... } }) con el SDK de MP
        return {
            checkoutUrl: `https://www.mercadopago.com/checkout/v1/payment?preference_id=stub_${params.externalReference}`,
            externalId: `stub_${params.externalReference}`,
        };
    }

    async verifyWebhook(payload: any, signatureHeader: string, countryCode: string = 'cl'): Promise<WebhookVerifyResult> {
        this.logger.log(`Verificando webhook MercadoPago, x-signature: ${signatureHeader}`);
        
        try {
            const secret = this.getWebhookSecret(countryCode);
            
            // x-signature: ts=1234567890,v1=abcdef...
            const parts = signatureHeader.split(',');
            let ts: string | undefined;
            let v1: string | undefined;

            for (const part of parts) {
                const [key, value] = part.split('=');
                if (key === 'ts') ts = value;
                if (key === 'v1') v1 = value;
            }

            if (!ts || !v1) {
                return { isValid: false, error: 'Formato de firma inválido' };
            }

            const dataToSign = `id:${payload?.data?.id};request-id:${payload?.id};ts:${ts};`;
            const expectedSignature = crypto
                .createHmac('sha256', secret)
                .update(dataToSign)
                .digest('hex');

            if (expectedSignature !== v1) {
                return { isValid: false, error: 'Firma inválida' };
            }

            return { isValid: true };
        } catch (err) {
            this.logger.error(`MercadoPago Webhook Error: ${(err as Error).message}`);
            return { isValid: false, error: (err as Error).message };
        }
    }

    /** Retorna el gateway configurado para un país específico */
    forCountry(countryCode: string): this {
        // Valida que el token exista al momento de configurar
        this.getAccessToken(countryCode);
        return this;
    }
}
