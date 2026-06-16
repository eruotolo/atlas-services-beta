import { Body, Controller, Post } from '@nestjs/common';

import { ChatbotService, type DetectServiceResult } from './chatbot.service';
import { DetectServiceDto } from './dto/detect-service.dto';

@Controller('chatbot')
export class ChatbotController {
    constructor(private readonly chatbot: ChatbotService) {}

    @Post('detect')
    detect(@Body() dto: DetectServiceDto): Promise<DetectServiceResult> {
        return this.chatbot.detectService(dto);
    }
}
