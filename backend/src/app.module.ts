import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

import { ApiKeyGuard } from '@common/guards/api-key.guard';

import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { GeoModule } from './modules/geo/geo.module';
import { InteractionsModule } from './modules/interactions/interactions.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { PricesModule } from './modules/prices/prices.module';
import { RatingsModule } from './modules/ratings/ratings.module';
import { ServicesModule } from './modules/services/services.module';
import { SponsorsModule } from './modules/sponsors/sponsors.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env.local', '.env'],
        }),
        ThrottlerModule.forRoot([
            { name: 'short', ttl: 1000, limit: 10 },
            { name: 'long', ttl: 60000, limit: 100 },
        ]),
        PrismaModule,
        AuthModule,
        UsersModule,
        GeoModule,
        PaymentsModule,
        CategoriesModule,
        ServicesModule,
        RatingsModule,
        SubscriptionsModule,
        SponsorsModule,
        PricesModule,
        InteractionsModule,
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ApiKeyGuard,
        },
    ],
})
export class AppModule {}
