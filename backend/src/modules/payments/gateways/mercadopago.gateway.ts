import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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

    async verifyWebhook(_payload: unknown, signature: string): Promise<WebhookVerifyResult> {
        // La verificación real usaría HMAC-SHA256 con el webhook secret de MP
        this.logger.log(`Verificando webhook MercadoPago, signature: ${signature}`);
        return { isValid: true };
    }

    /** Retorna el gateway configurado para un país específico */
    forCountry(countryCode: string): this {
        // Valida que el token exista al momento de configurar
        this.getAccessToken(countryCode);
        return this;
    }
}
