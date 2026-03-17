import { Module } from '@nestjs/common';

import { ServicesModule } from '../services/services.module';
import { RatingsController } from './ratings.controller';
import { RatingsService } from './ratings.service';

@Module({
    imports: [ServicesModule],
    controllers: [RatingsController],
    providers: [RatingsService],
})
export class RatingsModule {}
