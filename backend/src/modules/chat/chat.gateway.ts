import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';

import { ChatService } from './chat.service';

interface AuthenticatedSocket extends Socket {
    userId?: string;
}

@WebSocketGateway({
    cors: {
        origin: '*',
    },
    namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(ChatGateway.name);

    constructor(
        private readonly chatService: ChatService,
        private readonly jwtService: JwtService,
    ) {}

    async handleConnection(client: AuthenticatedSocket) {
        try {
            const token =
                client.handshake.auth?.token ||
                client.handshake.headers?.authorization?.replace('Bearer ', '');

            if (!token) {
                this.logger.warn('Client connection rejected: no token');
                client.disconnect();
                return;
            }

            const payload = this.jwtService.verify(token);
            client.userId = payload.sub;

            // Unir al socket a una room personal para recibir mensajes
            void client.join(`user:${client.userId}`);
            this.logger.log(`Client connected: ${client.userId}`);
        } catch {
            this.logger.warn('Client connection rejected: invalid token');
            client.disconnect();
        }
    }

    handleDisconnect(client: AuthenticatedSocket) {
        if (client.userId) {
            this.logger.log(`Client disconnected: ${client.userId}`);
        }
    }

    @SubscribeMessage('join_conversation')
    async handleJoinConversation(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { conversationId: string },
    ) {
        if (!client.userId) return;
        void client.join(`conversation:${data.conversationId}`);

        // Marcar mensajes como leídos cuando el usuario abre la conversación
        await this.chatService.markAsRead(data.conversationId, client.userId);
    }

    @SubscribeMessage('leave_conversation')
    handleLeaveConversation(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { conversationId: string },
    ) {
        if (!client.userId) return;
        void client.leave(`conversation:${data.conversationId}`);
    }

    @SubscribeMessage('send_message')
    async handleSendMessage(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { conversationId: string; text: string },
    ) {
        if (!client.userId) return;

        try {
            const message = await this.chatService.createMessage(
                data.conversationId,
                client.userId,
                data.text,
            );

            // Emitir a todos en la room de la conversación
            this.server
                .to(`conversation:${data.conversationId}`)
                .emit('new_message', message);

            // También notificar la room personal del otro usuario
            // para actualizar el badge de no leídos
            const conversations = await this.chatService.getConversationsByUser(client.userId);
            const conv = conversations.find((c) => c.id === data.conversationId);
            if (conv) {
                this.server
                    .to(`user:${conv.otherUser.id}`)
                    .emit('unread_update', { conversationId: data.conversationId });
            }
        } catch (error) {
            client.emit('error', { message: 'Error al enviar mensaje' });
            this.logger.error('Error sending message:', error);
        }
    }

    @SubscribeMessage('mark_read')
    async handleMarkRead(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { conversationId: string },
    ) {
        if (!client.userId) return;
        await this.chatService.markAsRead(data.conversationId, client.userId);

        this.server
            .to(`conversation:${data.conversationId}`)
            .emit('messages_read', { conversationId: data.conversationId, readBy: client.userId });
    }
}
