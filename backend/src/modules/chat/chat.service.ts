import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ChatService {
    constructor(private readonly prisma: PrismaService) {}

    async getOrCreateConversation(serviceId: string, clientId: string) {
        // Obtener el servicio para saber quién es el proveedor
        const service = await this.prisma.service.findUnique({
            where: { id: serviceId },
            select: { id: true, userId: true, title: true },
        });
        if (!service) throw new NotFoundException(`Servicio ${serviceId} no encontrado`);

        if (service.userId === clientId) {
            throw new ForbiddenException('No puedes iniciar una conversación con tu propio servicio');
        }

        // Buscar conversación existente
        const existing = await this.prisma.conversation.findUnique({
            where: { serviceId_clientId: { serviceId, clientId } },
            select: {
                id: true,
                serviceId: true,
                lastMessageAt: true,
                service: { select: { title: true, mainImage: true } },
                client: { select: { id: true, name: true, avatar: true } },
                provider: { select: { id: true, name: true, avatar: true } },
            },
        });
        if (existing) return existing;

        // Crear nueva conversación
        return this.prisma.conversation.create({
            data: {
                serviceId,
                clientId,
                providerId: service.userId,
            },
            select: {
                id: true,
                serviceId: true,
                lastMessageAt: true,
                service: { select: { title: true, mainImage: true } },
                client: { select: { id: true, name: true, avatar: true } },
                provider: { select: { id: true, name: true, avatar: true } },
            },
        });
    }

    async getConversationsByUser(userId: string) {
        const conversations = await this.prisma.conversation.findMany({
            where: {
                OR: [{ clientId: userId }, { providerId: userId }],
            },
            orderBy: { lastMessageAt: 'desc' },
            select: {
                id: true,
                serviceId: true,
                clientId: true,
                providerId: true,
                lastMessageAt: true,
                service: { select: { title: true, mainImage: true, slug: true } },
                client: { select: { id: true, name: true, avatar: true } },
                provider: { select: { id: true, name: true, avatar: true } },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    select: { text: true, createdAt: true, read: true, senderId: true },
                },
            },
        });

        return conversations.map((c) => {
            const lastMessage = c.messages[0] ?? null;
            const otherUser = c.clientId === userId ? c.provider : c.client;
            const unreadForMe = lastMessage && !lastMessage.read && lastMessage.senderId !== userId;

            return {
                id: c.id,
                serviceId: c.serviceId,
                serviceTitle: c.service.title,
                serviceImage: c.service.mainImage,
                serviceSlug: c.service.slug,
                otherUser,
                lastMessage: lastMessage
                    ? { text: lastMessage.text, date: lastMessage.createdAt, unread: !!unreadForMe }
                    : null,
                lastMessageAt: c.lastMessageAt,
            };
        });
    }

    async getMessages(conversationId: string, userId: string, page = 1, limit = 50) {
        // Verificar que el usuario es parte de la conversación
        const conversation = await this.prisma.conversation.findUnique({
            where: { id: conversationId },
            select: { clientId: true, providerId: true },
        });
        if (!conversation) throw new NotFoundException('Conversación no encontrada');
        if (conversation.clientId !== userId && conversation.providerId !== userId) {
            throw new ForbiddenException('No tienes acceso a esta conversación');
        }

        const skip = (page - 1) * limit;

        const [messages, total] = await Promise.all([
            this.prisma.message.findMany({
                where: { conversationId },
                orderBy: { createdAt: 'asc' },
                skip,
                take: limit,
                select: {
                    id: true,
                    senderId: true,
                    senderType: true,
                    text: true,
                    read: true,
                    createdAt: true,
                },
            }),
            this.prisma.message.count({ where: { conversationId } }),
        ]);

        return { data: messages, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }

    async createMessage(conversationId: string, senderId: string, text: string) {
        const conversation = await this.prisma.conversation.findUnique({
            where: { id: conversationId },
            select: { clientId: true, providerId: true },
        });
        if (!conversation) throw new NotFoundException('Conversación no encontrada');
        if (conversation.clientId !== senderId && conversation.providerId !== senderId) {
            throw new ForbiddenException('No tienes acceso a esta conversación');
        }

        const senderType = conversation.clientId === senderId ? 'CLIENT' : 'PROVIDER';

        const [message] = await this.prisma.$transaction([
            this.prisma.message.create({
                data: {
                    conversationId,
                    senderId,
                    senderType,
                    text,
                },
                select: {
                    id: true,
                    senderId: true,
                    senderType: true,
                    text: true,
                    read: true,
                    createdAt: true,
                },
            }),
            this.prisma.conversation.update({
                where: { id: conversationId },
                data: { lastMessageAt: new Date() },
            }),
        ]);

        return message;
    }

    async markAsRead(conversationId: string, userId: string) {
        // Solo marcar como leídos los mensajes que NO fueron enviados por el usuario
        await this.prisma.message.updateMany({
            where: {
                conversationId,
                senderId: { not: userId },
                read: false,
            },
            data: { read: true },
        });
        return { success: true };
    }

    async getUnreadCount(userId: string) {
        // Obtener todas las conversaciones del usuario
        const conversations = await this.prisma.conversation.findMany({
            where: { OR: [{ clientId: userId }, { providerId: userId }] },
            select: { id: true },
        });

        if (conversations.length === 0) return { count: 0 };

        const count = await this.prisma.message.count({
            where: {
                conversationId: { in: conversations.map((c) => c.id) },
                senderId: { not: userId },
                read: false,
            },
        });

        return { count };
    }
}
