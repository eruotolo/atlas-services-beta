import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { SocialMediaType } from '@prisma/client';
import type { Prisma, ServiceLevel } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

import type { CreateServiceDto } from './dto/create-service.dto';
import type { QueryServicesDto } from './dto/query-services.dto';
import type { UpdateServiceDto } from './dto/update-service.dto';

const MAX_MONTHS_END_DATE = 12;

function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

@Injectable()
export class ServicesService {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(query: QueryServicesDto) {
        const {
            query: textQuery,
            category,
            comuna,
            categoriaSlug,
            nivel,
            destacado,
            page = 1,
            limit = 20,
            countryCode,
            regionCode,
            localitySlug,
        } = query;
        const skip = (page - 1) * limit;

        const where: Prisma.ServiceWhereInput = {
            active: true,
            endDate: { gte: new Date() },
            ...(comuna && { commune: comuna }),
            ...(nivel && { level: nivel as ServiceLevel }),
            ...(destacado !== undefined && { featured: destacado }),
            ...(countryCode && { country: { code: countryCode.toLowerCase() } }),
            ...(regionCode && { region: { code: regionCode } }),
            ...(localitySlug && { locality: { slug: localitySlug } }),
            ...(categoriaSlug && {
                categories: { some: { category: { slug: categoriaSlug } } },
            }),
            ...(category && {
                categories: { some: { category: { name: { contains: category, mode: 'insensitive' } } } },
            }),
            ...(textQuery && {
                OR: [
                    { title: { contains: textQuery, mode: 'insensitive' } },
                    { description: { contains: textQuery, mode: 'insensitive' } },
                    { user: { name: { contains: textQuery, mode: 'insensitive' } } },
                ],
            }),
        };

        const [items, total] = await this.prisma.$transaction([
            this.prisma.service.findMany({
                where,
                skip,
                take: limit,
                orderBy: [{ featured: 'desc' }, { averageRating: 'desc' }],
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
            }),
            this.prisma.service.count({ where }),
        ]);

        const totalPages = Math.ceil(total / limit);
        return {
            data: items.map((s) => ({
                ...s,
                userId: s.user.id,
                userName: s.user.name,
                userAvatar: s.user.avatar,
                categories: s.categories.map((c) => c.category),
                isTopPro: Number(s.averageRating ?? 0) >= 4.5 && s.totalRatings >= 10,
                user: undefined,
            })),
            meta: { total, page, limit, totalPages },
        };
    }

    async findBySlug(slug: string) {
        const service = await this.prisma.service.findUnique({
            where: { slug },
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
                images: true,
                contactName: true,
                contactEmail: true,
                contactPhone: true,
                startDate: true,
                endDate: true,
                updatedAt: true,
                user: { select: { id: true, name: true, email: true, phone: true, avatar: true } },
                categories: {
                    select: { category: { select: { id: true, name: true, slug: true, icon: true } } },
                },
                socialMedia: { select: { id: true, type: true, url: true } },
                ratings: {
                    where: { status: 'ACTIVE' },
                    select: {
                        id: true,
                        stars: true,
                        comment: true,
                        ownerResponse: true,
                        respondedAt: true,
                        createdAt: true,
                        user: { select: { name: true } },
                    },
                },
                subscription: { select: { active: true, endDate: true } },
            },
        });
        if (!service) throw new NotFoundException(`Servicio "${slug}" no encontrado`);

        const { user, categories, socialMedia, ratings, ...rest } = service;
        return {
            ...rest,
            userId: user.id,
            userName: user.name,
            userEmail: user.email,
            userPhone: user.phone,
            userAvatar: user.avatar,
            isTopPro: Number(rest.averageRating ?? 0) >= 4.5 && rest.totalRatings >= 10,
            categories: categories.map((c) => c.category),
            socialNetworks: socialMedia.map((sm) => ({ id: sm.id, tipo: sm.type, url: sm.url })),
            reviews: ratings.map((r) => ({
                id: r.id,
                userName: r.user.name,
                rating: r.stars,
                comment: r.comment,
                ownerResponse: r.ownerResponse,
                respondedAt: r.respondedAt ? r.respondedAt.toISOString() : null,
                date: r.createdAt.toISOString(),
            })),
        };
    }

    async findById(id: string) {
        return this.prisma.service.findUnique({
            where: { id },
            select: { id: true, userId: true, startDate: true },
        });
    }

    async create(dto: CreateServiceDto, userId: string) {
        const startDate = new Date();
        const endDate = dto.fechaFin
            ? new Date(dto.fechaFin)
            : new Date(new Date().setMonth(new Date().getMonth() + 12));
        if (dto.fechaFin) this.validateEndDate(startDate, endDate);

        // Auto-generar slug único si no viene en el DTO
        let slug = dto.slug ?? slugify(dto.titulo);
        const base = slugify(dto.titulo);
        let counter = 1;
        while (await this.prisma.service.findUnique({ where: { slug }, select: { id: true } })) {
            slug = `${base}-${counter++}`;
        }

        // Resolver countryId desde countryCode
        const country = await this.prisma.country.findUnique({
            where: { code: dto.countryCode.toLowerCase() },
            select: { id: true },
        });
        if (!country) {
            throw new Error(`País "${dto.countryCode}" no encontrado`);
        }

        // Resolver regionId desde regionCode (opcional)
        let regionId: string | undefined;
        if (dto.regionCode) {
            const region = await this.prisma.geoRegion.findFirst({
                where: { countryId: country.id, code: dto.regionCode },
                select: { id: true },
            });
            regionId = region?.id;
        }

        // Resolver localityId desde localitySlug (opcional)
        let localityId: string | undefined;
        if (dto.localitySlug && regionId) {
            const locality = await this.prisma.geoLocality.findFirst({
                where: { regionId, slug: dto.localitySlug },
                select: { id: true },
            });
            localityId = locality?.id;
        }

        const { categoriaIds, redesSociales, ...data } = dto;

        return this.prisma.service.create({
            data: {
                title: data.titulo,
                slug,
                description: data.descripcion,
                price: data.precio,
                commune: data.comuna,
                contactName: data.nombreContacto,
                contactEmail: data.emailContacto,
                contactPhone: data.telefonoContacto,
                mainImage: data.imagenPrincipal,
                images: data.imagenes ?? [],
                level: data.nivel,
                featured: data.destacado ?? false,
                endDate,
                user: { connect: { id: userId } },
                country: { connect: { id: country.id } },
                ...(regionId && { region: { connect: { id: regionId } } }),
                ...(localityId && { locality: { connect: { id: localityId } } }),
                categories: {
                    create: categoriaIds.map((categoryId) => ({
                        category: { connect: { id: categoryId } },
                    })),
                },
                ...(redesSociales?.length && {
                    socialMedia: {
                        create: redesSociales.map((rs) => ({ type: rs.tipo as SocialMediaType, url: rs.url })),
                    },
                }),
            } as Prisma.ServiceCreateInput,
            select: {
                id: true,
                title: true,
                slug: true,
                level: true,
                endDate: true,
                createdAt: true,
            },
        });
    }

    async update(id: string, dto: UpdateServiceDto, requesterId: string) {
        const service = await this.findById(id);
        if (!service) throw new NotFoundException(`Servicio ${id} no encontrado`);
        if (service.userId !== requesterId) {
            throw new ForbiddenException('Solo puedes editar tus propios servicios');
        }

        const { categoriaIds, fechaFin, ...data } = dto;

        if (fechaFin) {
            this.validateEndDate(service.startDate, new Date(fechaFin));
        }

        return this.prisma.service.update({
            where: { id },
            data: {
                ...(data.titulo && { title: data.titulo }),
                ...(data.slug && { slug: data.slug }),
                ...(data.descripcion && { description: data.descripcion }),
                ...(data.precio !== undefined && { price: data.precio }),
                ...(data.comuna && { commune: data.comuna }),
                ...(data.nombreContacto && { contactName: data.nombreContacto }),
                ...(data.emailContacto && { contactEmail: data.emailContacto }),
                ...(data.telefonoContacto && { contactPhone: data.telefonoContacto }),
                ...(data.imagenPrincipal && { mainImage: data.imagenPrincipal }),
                ...(data.imagenes && { images: data.imagenes }),
                ...(data.nivel && { level: data.nivel }),
                ...(data.destacado !== undefined && { featured: data.destacado }),
                ...(fechaFin && { endDate: new Date(fechaFin) }),
                ...(categoriaIds && {
                    categories: {
                        deleteMany: {},
                        create: categoriaIds.map((categoryId) => ({
                            category: { connect: { id: categoryId } },
                        })),
                    },
                }),
            },
            select: {
                id: true,
                title: true,
                slug: true,
                level: true,
                featured: true,
                endDate: true,
                updatedAt: true,
            },
        });
    }

    async delete(id: string, requesterId: string, requesterRoles: string[]) {
        const service = await this.findById(id);
        if (!service) throw new NotFoundException(`Servicio ${id} no encontrado`);

        const isAdmin = requesterRoles.includes('admin');
        if (service.userId !== requesterId && !isAdmin) {
            throw new ForbiddenException('No tienes permiso para eliminar este servicio');
        }

        return this.prisma.service.delete({
            where: { id },
            select: { id: true },
        });
    }

    recalcularCalificacion(serviceId: string) {
        return this.prisma.$queryRaw<void>`
            UPDATE services
            SET
                "averageRating" = (
                    SELECT ROUND(AVG(stars)::numeric, 1)
                    FROM ratings
                    WHERE "serviceId" = ${serviceId} AND status = 'ACTIVE'
                ),
                "totalRatings" = (
                    SELECT COUNT(*)
                    FROM ratings
                    WHERE "serviceId" = ${serviceId} AND status = 'ACTIVE'
                )
            WHERE id = ${serviceId}
        `;
    }

    async toggleActiveOwner(id: string, userId: string) {
        const service = await this.prisma.service.findUnique({
            where: { id },
            select: { id: true, userId: true, active: true },
        });
        if (!service) throw new NotFoundException(`Servicio ${id} no encontrado`);
        if (service.userId !== userId) {
            throw new ForbiddenException('Solo puedes modificar tus propios servicios');
        }
        return this.prisma.service.update({
            where: { id },
            data: { active: !service.active },
            select: { id: true, active: true },
        });
    }

    async toggleActive(id: string) {
        const service = await this.prisma.service.findUnique({
            where: { id },
            select: { id: true, active: true },
        });
        if (!service) throw new NotFoundException(`Servicio ${id} no encontrado`);
        return this.prisma.service.update({
            where: { id },
            data: { active: !service.active },
            select: { id: true, active: true },
        });
    }

    async toggleFeatured(id: string) {
        const service = await this.prisma.service.findUnique({
            where: { id },
            select: { id: true, featured: true },
        });
        if (!service) throw new NotFoundException(`Servicio ${id} no encontrado`);
        const featured = !service.featured;
        return this.prisma.service.update({
            where: { id },
            data: {
                featured,
                level: featured ? 'PREMIUM' : 'BASIC',
            },
            select: { id: true, featured: true, level: true },
        });
    }

    private validateEndDate(startDate: Date, endDate: Date) {
        const maxEndDate = new Date(startDate);
        maxEndDate.setMonth(maxEndDate.getMonth() + MAX_MONTHS_END_DATE);

        if (endDate > maxEndDate) {
            throw new BadRequestException(
                `La fecha de fin no puede superar ${MAX_MONTHS_END_DATE} meses desde la fecha de inicio`,
            );
        }
        if (endDate <= startDate) {
            throw new BadRequestException('La fecha de fin debe ser posterior a la fecha de inicio');
        }
    }
}
