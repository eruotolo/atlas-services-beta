import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InteractionType } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { ServicesService } from '../services/services.service';

import type { CreateInteractionDto } from './dto/create-interaction.dto';

@Injectable()
export class InteractionsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly servicesService: ServicesService,
    ) {}

    create(dto: CreateInteractionDto) {
        return this.prisma.interaction.create({
            data: {
                type: dto.tipo,
                service: { connect: { id: dto.serviceId } },
                ...(dto.usuarioId && { user: { connect: { id: dto.usuarioId } } }),
            },
            select: { id: true, type: true, serviceId: true, userId: true, createdAt: true },
        });
    }

    async findAllPaginated(page: number = 1, limit: number = 20, query?: string) {
        const skip = (page - 1) * limit;
        const where = query
            ? {
                  OR: [
                      { serviceId: query },
                      { type: Object.values(InteractionType).includes(query.toUpperCase() as InteractionType)
                          ? (query.toUpperCase() as InteractionType)
                          : undefined },
                  ].filter((c) => c !== undefined),
              }
            : {};

        const [items, total] = await Promise.all([
            this.prisma.interaction.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    type: true,
                    serviceId: true,
                    userId: true,
                    createdAt: true,
                    service: { select: { title: true } },
                },
            }),
            this.prisma.interaction.count({ where }),
        ]);

        return {
            data: items,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    async getMetricas() {
        const [totalGlobal, porTipoRaw, topServiciosRaw] = await Promise.all([
            this.prisma.interaction.count(),
            this.prisma.interaction.groupBy({
                by: ['type'],
                _count: { type: true },
            }),
            this.prisma.interaction.groupBy({
                by: ['serviceId'],
                _count: { serviceId: true },
                orderBy: { _count: { serviceId: 'desc' } },
                take: 10,
            }),
        ]);

        const porTipo: Record<string, number> = {};
        for (const g of porTipoRaw) {
            porTipo[g.type] = g._count.type;
        }

        const serviceIds = topServiciosRaw.map((g) => g.serviceId);
        const servicios = await this.prisma.service.findMany({
            where: { id: { in: serviceIds } },
            select: { id: true, title: true },
        });
        const tituloMap = new Map(servicios.map((s) => [s.id, s.title]));

        const topServicios = topServiciosRaw.map((g) => ({
            serviceId: g.serviceId,
            title: tituloMap.get(g.serviceId) ?? '',
            count: g._count.serviceId,
        }));

        return { totalGlobal, porTipo, topServicios };
    }

    async estadisticas(serviceId: string, requesterId: string, requesterRoles: string[]) {
        const service = await this.servicesService.findById(serviceId);
        if (!service) throw new NotFoundException(`Servicio ${serviceId} no encontrado`);

        const isAdmin = requesterRoles.includes('admin');
        if (service.userId !== requesterId && !isAdmin) {
            throw new ForbiddenException('Solo el dueño del servicio puede ver sus estadísticas');
        }

        const grupos = await this.prisma.interaction.groupBy({
            by: ['type'],
            where: { serviceId },
            _count: { type: true },
        });
        return grupos.map((g) => ({ type: g.type as InteractionType, total: g._count.type }));
    }
}
