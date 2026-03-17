import { Module } from '@nestjs/common';

import { PricesModule } from '../prices/prices.module';
import { ServicesModule } from '../services/services.module';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';

@Module({
    imports: [ServicesModule, PricesModule],
    controllers: [SubscriptionsController],
    providers: [SubscriptionsService],
})
export class SubscriptionsModule {}
