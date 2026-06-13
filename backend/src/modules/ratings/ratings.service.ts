import {
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { whereServiceCountry } from '@common/utils/where-service-country';

import { PrismaService } from '../../prisma/prisma.service';
import { ServicesService } from '../services/services.service';

import type { CreateRatingDto } from './dto/create-rating.dto';
import type { QueryRatingsDto } from './dto/query-ratings.dto';
import type { UpdateRatingDto } from './dto/update-rating.dto';

@Injectable()
export class RatingsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly servicesService: ServicesService,
    ) {}

    async findAll(dto: QueryRatingsDto) {
        const { page = 1, limit = 10, query, countryCode } = dto;
        const skip = (page - 1) * limit;
        const where = {
            ...whereServiceCountry(countryCode),
            ...(query && {
                OR: [
                    { user: { name: { contains: query, mode: 'insensitive' as const } } },
                    { user: { email: { contains: query, mode: 'insensitive' as const } } },
                    { service: { title: { contains: query, mode: 'insensitive' as const } } },
                    { comment: { contains: query, mode: 'insensitive' as const } },
                ],
            }),
        };

        const [items, total] = await Promise.all([
            this.prisma.rating.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    stars: true,
                    comment: true,
                    status: true,
                    createdAt: true,
                    user: { select: { id: true, name: true, email: true, avatar: true } },
                    service: { select: { id: true, title: true } },
                },
            }),
            this.prisma.rating.count({ where }),
        ]);
        return { data: items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }

    findByServicio(serviceId: string) {
        return this.prisma.rating.findMany({
            where: { serviceId, status: 'ACTIVE' },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                stars: true,
                comment: true,
                ownerResponse: true,
                respondedAt: true,
                createdAt: true,
                serviceId: true,
                userId: true,
                status: true,
                user: { select: { id: true, name: true, avatar: true } },
            },
        });
    }

    async create(serviceId: string, dto: CreateRatingDto, userId: string) {
        const service = await this.prisma.service.findUnique({
            where: { id: serviceId },
            select: { id: true, userId: true },
        });
        if (!service) throw new NotFoundException(`Servicio ${serviceId} no encontrado`);

        if (service.userId === userId) {
            throw new ForbiddenException('No puedes reseñar tu propio servicio');
        }

        const existing = await this.prisma.rating.findUnique({
            where: { serviceId_userId: { serviceId, userId } },
            select: { id: true },
        });
        if (existing) throw new ConflictException('Ya calificaste este servicio');

        const rating = await this.prisma.rating.create({
            data: {
                stars: dto.estrellas,
                comment: dto.comentario,
                service: { connect: { id: serviceId } },
                user: { connect: { id: userId } },
            },
            select: {
                id: true,
                stars: true,
                comment: true,
                serviceId: true,
                userId: true,
                createdAt: true,
            },
        });

        void this.servicesService.recalcularCalificacion(serviceId);
        return rating;
    }

    async update(id: string, dto: UpdateRatingDto) {
        const rating = await this.prisma.rating.findUnique({
            where: { id },
            select: { id: true, serviceId: true },
        });
        if (!rating) throw new NotFoundException(`Calificación ${id} no encontrada`);

        const updated = await this.prisma.rating.update({
            where: { id },
            data: {
                ...(dto.estrellas !== undefined && { stars: dto.estrellas }),
                ...(dto.comentario !== undefined && { comment: dto.comentario }),
                ...(dto.estado !== undefined && { status: dto.estado }),
            },
            select: {
                id: true,
                stars: true,
                comment: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                user: { select: { id: true, name: true, email: true } },
                service: { select: { id: true, title: true } },
            },
        });

        // Si cambió el status, recalcular el promedio del servicio (solo cuenta ACTIVE)
        if (dto.estado !== undefined) {
            void this.servicesService.recalcularCalificacion(rating.serviceId);
        }

        return updated;
    }

    async delete(id: string, requesterId: string, requesterRoles: string[]) {
        const rating = await this.prisma.rating.findUnique({
            where: { id },
            select: { id: true, userId: true, serviceId: true },
        });
        if (!rating) throw new NotFoundException(`Calificación ${id} no encontrada`);

        const isAdmin = requesterRoles.includes('admin');
        if (rating.userId !== requesterId && !isAdmin) {
            throw new ForbiddenException('No tienes permiso para eliminar esta calificación');
        }

        await this.prisma.rating.delete({ where: { id }, select: { id: true } });
        void this.servicesService.recalcularCalificacion(rating.serviceId);
    }

    async replyToRating(ratingId: string, serviceId: string, userId: string, response: string) {
        const rating = await this.prisma.rating.findUnique({
            where: { id: ratingId },
            select: { id: true, serviceId: true, ownerResponse: true },
        });
        if (!rating) throw new NotFoundException(`Calificación ${ratingId} no encontrada`);
        if (rating.serviceId !== serviceId) {
            throw new NotFoundException('La calificación no pertenece a este servicio');
        }
        if (rating.ownerResponse) {
            throw new ConflictException('Ya se ha respondido a esta calificación');
        }

        // Verificar que el usuario es dueño del servicio
        const service = await this.prisma.service.findUnique({
            where: { id: serviceId },
            select: { userId: true },
        });
        if (!service) throw new NotFoundException(`Servicio ${serviceId} no encontrado`);
        if (service.userId !== userId) {
            throw new ForbiddenException('Solo el dueño del servicio puede responder reseñas');
        }

        return this.prisma.rating.update({
            where: { id: ratingId },
            data: {
                ownerResponse: response,
                respondedAt: new Date(),
            },
            select: {
                id: true,
                ownerResponse: true,
                respondedAt: true,
            },
        });
    }
}
