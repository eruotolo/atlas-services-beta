import { Module } from '@nestjs/common';

import { CategoriesModule } from '../categories/categories.module';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';

@Module({
    imports: [CategoriesModule],
    controllers: [ChatbotController],
    providers: [ChatbotService],
})
export class ChatbotModule {}
