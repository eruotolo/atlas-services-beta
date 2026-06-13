import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

import type { CreateCategoryDto } from './dto/create-category.dto';
import type { UpdateCategoryDto } from './dto/update-category.dto';

const CATEGORY_SELECT = {
    id: true,
    name: true,
    nameEn: true,
    slug: true,
    icon: true,
    order: true,
    active: true,
} as const;

@Injectable()
export class CategoriesService {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(countryCode?: string) {
        const normalizedCode = countryCode?.toLowerCase();
        const where: Prisma.ServiceCategoryWhereInput = normalizedCode
            ? { active: true, OR: [{ countryCode: null }, { countryCode: normalizedCode }] }
            : { active: true };

        const categories = await this.prisma.serviceCategory.findMany({
            where,
            orderBy: { order: 'asc' },
            select: {
                ...CATEGORY_SELECT,
                _count: {
                    select: {
                        services: normalizedCode
                            ? {
                                  where: {
                                      service: {
                                          active: true,
                                          country: { code: normalizedCode },
                                      },
                                  },
                              }
                            : { where: { service: { active: true } } },
                    },
                },
            },
        });

        return categories.map(({ _count, ...rest }) => ({
            ...rest,
            serviceCount: _count.services,
        }));
    }

    async findById(id: string) {
        const category = await this.prisma.serviceCategory.findUnique({
            where: { id },
            select: CATEGORY_SELECT,
        });
        if (!category) throw new NotFoundException(`Categoría ${id} no encontrada`);
        return category;
    }

    create(dto: CreateCategoryDto) {
        return this.prisma.serviceCategory.create({
            data: {
                name: dto.nombre,
                nameEn: dto.nombreEn ?? null,
                slug: dto.slug,
                icon: dto.icono,
                order: dto.orden,
                active: dto.activo,
            } as Prisma.ServiceCategoryCreateInput,
            select: CATEGORY_SELECT,
        });
    }

    async update(id: string, dto: UpdateCategoryDto) {
        await this.findById(id);
        return this.prisma.serviceCategory.update({
            where: { id },
            data: {
                ...(dto.nombre && { name: dto.nombre }),
                ...(dto.nombreEn !== undefined && { nameEn: dto.nombreEn || null }),
                ...(dto.slug && { slug: dto.slug }),
                ...(dto.icono !== undefined && { icon: dto.icono }),
                ...(dto.orden !== undefined && { order: dto.orden }),
                ...(dto.activo !== undefined && { active: dto.activo }),
            },
            select: CATEGORY_SELECT,
        });
    }

    async findAllPaginated(page: number = 1, limit: number = 12, query?: string) {
        const skip = (page - 1) * limit;
        const where: Prisma.ServiceCategoryWhereInput = query
            ? { name: { contains: query, mode: 'insensitive' } }
            : {};

        const [items, total] = await Promise.all([
            this.prisma.serviceCategory.findMany({
                where,
                skip,
                take: limit,
                orderBy: { order: 'asc' },
                select: CATEGORY_SELECT,
            }),
            this.prisma.serviceCategory.count({ where }),
        ]);

        return {
            data: items,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    async delete(id: string) {
        await this.findById(id);
        return this.prisma.serviceCategory.delete({
            where: { id },
            select: { id: true },
        });
    }
}
