export interface PaymentGatewayInterface {
    /**
     * Inicializa una preferencia/intent de pago y retorna la URL de checkout
     * o el client_secret según el gateway.
     */
    createPayment(params: CreatePaymentParams): Promise<PaymentResult>;

    /** Verifica si una notificación/webhook es auténtica */
    verifyWebhook(payload: unknown, signature: string): Promise<WebhookVerifyResult>;
}

export interface CreatePaymentParams {
    amount: number;
    currency: string;
    description: string;
    externalReference: string;
    successUrl?: string;
    failureUrl?: string;
    pendingUrl?: string;
}

export interface PaymentResult {
    checkoutUrl?: string;
    clientSecret?: string;
    externalId: string;
    raw?: unknown;
}

export interface WebhookVerifyResult {
    isValid: boolean;
    eventType?: string;
    resourceId?: string;
    status?: string;
}
