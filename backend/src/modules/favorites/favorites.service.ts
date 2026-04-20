import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FavoritesService {
    constructor(private readonly prisma: PrismaService) {}

    async addFavorite(userId: string, serviceId: string) {
        // Verificar que el servicio existe
        const service = await this.prisma.service.findUnique({
            where: { id: serviceId },
            select: { id: true },
        });
        if (!service) throw new NotFoundException(`Servicio ${serviceId} no encontrado`);

        // Verificar que no sea duplicado
        const existing = await this.prisma.favorite.findUnique({
            where: { userId_serviceId: { userId, serviceId } },
            select: { id: true },
        });
        if (existing) throw new ConflictException('Este servicio ya está en tus favoritos');

        return this.prisma.favorite.create({
            data: { userId, serviceId },
            select: { id: true, serviceId: true, createdAt: true },
        });
    }

    async removeFavorite(userId: string, serviceId: string) {
        const favorite = await this.prisma.favorite.findUnique({
            where: { userId_serviceId: { userId, serviceId } },
            select: { id: true },
        });
        if (!favorite) throw new NotFoundException('Favorito no encontrado');

        await this.prisma.favorite.delete({ where: { id: favorite.id } });
        return { removed: true };
    }

    async getFavorites(userId: string) {
        const favorites = await this.prisma.favorite.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                createdAt: true,
                service: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        description: true,
                        price: true,
                        commune: true,
                        level: true,
                        featured: true,
                        averageRating: true,
                        totalRatings: true,
                        mainImage: true,
                        endDate: true,
                        user: { select: { id: true, name: true, avatar: true } },
                        categories: {
                            select: {
                                category: { select: { id: true, name: true, slug: true, icon: true } },
                            },
                        },
                    },
                },
            },
        });

        return favorites.map((f) => ({
            id: f.id,
            savedAt: f.createdAt,
            service: {
                ...f.service,
                userId: f.service.user.id,
                userName: f.service.user.name,
                userAvatar: f.service.user.avatar,
                categories: f.service.categories.map((c) => c.category),
                user: undefined,
            },
        }));
    }

    async isFavorite(userId: string, serviceId: string) {
        const favorite = await this.prisma.favorite.findUnique({
            where: { userId_serviceId: { userId, serviceId } },
            select: { id: true },
        });
        return { isFavorite: !!favorite };
    }
}
