import { Module } from '@nestjs/common';

import { MercadoPagoGateway } from '../payments/gateways/mercadopago.gateway';
import { StripeGateway } from '../payments/gateways/stripe.gateway';
import { PaymentsService } from '../payments/payments.service';
import { PricesModule } from '../prices/prices.module';
import { ServicesModule } from '../services/services.module';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';

@Module({
    imports: [ServicesModule, PricesModule],
    controllers: [SubscriptionsController],
    providers: [SubscriptionsService, PaymentsService, MercadoPagoGateway, StripeGateway],
})
export class SubscriptionsModule {}
