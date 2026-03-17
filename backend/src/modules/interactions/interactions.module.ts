import { Module } from '@nestjs/common';

import { ServicesModule } from '../services/services.module';
import { InteractionsController } from './interactions.controller';
import { InteractionsService } from './interactions.service';

@Module({
    imports: [ServicesModule],
    controllers: [InteractionsController],
    providers: [InteractionsService],
})
export class InteractionsModule {}
