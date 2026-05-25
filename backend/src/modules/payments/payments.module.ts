import { Module } from '@nestjs/common';

import { MercadoPagoGateway } from './gateways/mercadopago.gateway';
import { StripeGateway } from './gateways/stripe.gateway';
import { PaymentsService } from './payments.service';

@Module({
    providers: [PaymentsService, MercadoPagoGateway, StripeGateway],
    exports: [PaymentsService],
})
export class PaymentsModule {}
