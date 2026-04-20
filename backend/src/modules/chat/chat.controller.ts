import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';

import { ChatService } from './chat.service';

@ApiTags('chat')
@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class ChatController {
    constructor(private readonly service: ChatService) {}

    @Get('conversations')
    @ApiOperation({ summary: 'Listar conversaciones del usuario' })
    getConversations(@CurrentUser() user: { id: string }) {
        return this.service.getConversationsByUser(user.id);
    }

    @Post('conversations')
    @ApiOperation({ summary: 'Crear o obtener conversación por servicio' })
    createConversation(
        @Body('serviceId') serviceId: string,
        @CurrentUser() user: { id: string },
    ) {
        return this.service.getOrCreateConversation(serviceId, user.id);
    }

    @Get('conversations/:id/messages')
    @ApiOperation({ summary: 'Obtener mensajes de una conversación' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    getMessages(
        @Param('id') id: string,
        @CurrentUser() user: { id: string },
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.service.getMessages(id, user.id, page ? Number(page) : 1, limit ? Number(limit) : 50);
    }

    @Post('conversations/:id/read')
    @ApiOperation({ summary: 'Marcar mensajes como leídos' })
    markAsRead(
        @Param('id') id: string,
        @CurrentUser() user: { id: string },
    ) {
        return this.service.markAsRead(id, user.id);
    }

    @Get('unread-count')
    @ApiOperation({ summary: 'Conteo de mensajes no leídos' })
    getUnreadCount(@CurrentUser() user: { id: string }) {
        return this.service.getUnreadCount(user.id);
    }
}
