import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import type { CreateSponsorDto } from './dto/create-sponsor.dto';
import type { UpdateSponsorDto } from './dto/update-sponsor.dto';

const SPONSOR_SELECT = {
    id: true,
    name: true,
    level: true,
    imageUrl: true,
    externalLink: true,
    description: true,
    active: true,
    endDate: true,
    country: { select: { code: true, name: true } },
} as const;

@Injectable()
export class SponsorsService {
    constructor(private readonly prisma: PrismaService) {}

    findAll(countryCode?: string) {
        const where = countryCode
            ? {
                  active: true,
                  endDate: { gte: new Date() },
                  OR: [
                      { countryId: null },
                      { country: { code: countryCode.toLowerCase() } },
                  ],
              }
            : { active: true, endDate: { gte: new Date() } };

        return this.prisma.sponsor.findMany({
            where,
            orderBy: { level: 'asc' },
            select: SPONSOR_SELECT,
        });
    }

    async findAllPaginated(
        page: number = 1,
        limit: number = 20,
        query?: string,
        countryCode?: string,
        level?: string,
        activeOnly?: boolean,
    ) {
        const skip = (page - 1) * limit;
        const where = {
            ...(query && { name: { contains: query, mode: 'insensitive' as const } }),
            ...(countryCode && {
                OR: [{ countryId: null }, { country: { code: countryCode.toLowerCase() } }],
            }),
            ...(level && { level: level as 'STANDARD' | 'PREMIUM' | 'SENIOR' }),
            ...(activeOnly && { active: true, endDate: { gte: new Date() } }),
        };

        const [items, total] = await Promise.all([
            this.prisma.sponsor.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    ...SPONSOR_SELECT,
                    startDate: true,
                },
            }),
            this.prisma.sponsor.count({ where }),
        ]);

        return {
            data: items,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    async findById(id: string) {
        const sponsor = await this.prisma.sponsor.findUnique({
            where: { id },
            select: SPONSOR_SELECT,
        });
        if (!sponsor) throw new NotFoundException(`Sponsor ${id} no encontrado`);
        return sponsor;
    }

    create(dto: CreateSponsorDto) {
        return this.prisma.sponsor.create({
            data: {
                name: dto.nombre,
                level: dto.nivel,
                imageUrl: dto.imagenUrl,
                externalLink: dto.linkExterno,
                description: dto.descripcion,
                endDate: new Date(dto.fechaFin),
                ...(dto.fechaInicio && { startDate: new Date(dto.fechaInicio) }),
                ...(typeof dto.activo === 'boolean' && { active: dto.activo }),
                ...(dto.countryCode && {
                    country: { connect: { code: dto.countryCode.toLowerCase() } },
                }),
            },
            select: SPONSOR_SELECT,
        });
    }

    async update(id: string, dto: UpdateSponsorDto) {
        await this.findById(id);
        return this.prisma.sponsor.update({
            where: { id },
            data: {
                ...(dto.nombre && { name: dto.nombre }),
                ...(dto.nivel && { level: dto.nivel }),
                ...(dto.imagenUrl && { imageUrl: dto.imagenUrl }),
                ...(dto.linkExterno && { externalLink: dto.linkExterno }),
                ...(dto.descripcion !== undefined && { description: dto.descripcion }),
                ...(dto.fechaInicio && { startDate: new Date(dto.fechaInicio) }),
                ...(dto.fechaFin && { endDate: new Date(dto.fechaFin) }),
                ...(typeof dto.activo === 'boolean' && { active: dto.activo }),
                ...(dto.countryCode !== undefined && {
                    country: dto.countryCode
                        ? { connect: { code: dto.countryCode.toLowerCase() } }
                        : { disconnect: true },
                }),
            },
            select: SPONSOR_SELECT,
        });
    }

    async delete(id: string) {
        await this.findById(id);
        return this.prisma.sponsor.delete({
            where: { id },
            select: { id: true },
        });
    }
}
