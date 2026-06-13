import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

import type { AssignRolesDto } from './dto/assign-roles.dto';
import type { UpdatePasswordDto } from './dto/update-password.dto';
import type { UpdateUserDto } from './dto/update-user.dto';

const USER_SELECT = {
    id: true,
    name: true,
    email: true,
    phone: true,
    avatar: true,
    createdAt: true,
    roles: {
        select: {
            id: true,
            roleId: true,
            role: { select: { name: true } },
            country: { select: { code: true, name: true } },
        },
    },
};

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(page = 1, limit = 10, query?: string, roleNames?: string[]) {
        const skip = (page - 1) * limit;
        const where: Prisma.UserWhereInput = {
            ...(query
                ? {
                      OR: [
                          { name: { contains: query, mode: 'insensitive' as const } },
                          { email: { contains: query, mode: 'insensitive' as const } },
                      ],
                  }
                : {}),
            ...(roleNames?.length
                ? { roles: { some: { role: { name: { in: roleNames } } } } }
                : {}),
        };

        const [items, total] = await this.prisma.$transaction([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                select: USER_SELECT,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count({ where }),
        ]);

        return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    async findById(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: USER_SELECT,
        });
        if (!user) throw new NotFoundException(`Usuario ${id} no encontrado`);
        return user;
    }

    async findMe(userId: string) {
        return this.findById(userId);
    }

    async findUserServices(userId: string) {
        await this.findById(userId);
        return this.prisma.service.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                title: true,
                slug: true,
                description: true,
                price: true,
                commune: true,
                active: true,
                featured: true,
                level: true,
                mainImage: true,
                images: true,
                contactName: true,
                contactEmail: true,
                contactPhone: true,
                averageRating: true,
                totalRatings: true,
                startDate: true,
                endDate: true,
                createdAt: true,
                updatedAt: true,
                categories: {
                    select: { category: { select: { id: true, name: true, slug: true } } },
                },
                socialMedia: { select: { id: true, type: true, url: true } },
                subscription: {
                    select: { id: true, durationMonths: true, amount: true, endDate: true, active: true },
                },
            },
        });
    }

    async update(id: string, dto: UpdateUserDto, requesterId: string) {
        if (id !== requesterId) throw new ForbiddenException('Solo puedes editar tu propio perfil');
        await this.findById(id);
        return this.prisma.user.update({
            where: { id },
            data: {
                ...(dto.nombre !== undefined && { name: dto.nombre }),
                ...(dto.telefono !== undefined && { phone: dto.telefono }),
                ...(dto.avatar !== undefined && { avatar: dto.avatar }),
            },
            select: { id: true, name: true, email: true, phone: true, avatar: true, updatedAt: true },
        });
    }

    async updatePassword(userId: string, dto: UpdatePasswordDto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, password: true },
        });
        if (!user?.password) throw new NotFoundException('Usuario sin contraseña configurada');

        const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
        if (!isMatch) throw new UnauthorizedException('La contraseña actual es incorrecta');

        const hash = await bcrypt.hash(dto.newPassword, 12);
        await this.prisma.user.update({
            where: { id: userId },
            data: { password: hash },
        });

        return { message: 'Contraseña actualizada correctamente' };
    }

    async findRoles() {
        return this.prisma.role.findMany({
            where: { active: true },
            select: { id: true, name: true },
            orderBy: { name: 'asc' },
        });
    }

    async assignRoles(userId: string, dto: AssignRolesDto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true },
        });
        if (!user) throw new NotFoundException(`Usuario ${userId} no encontrado`);

        const roles = await this.prisma.role.findMany({
            where: { id: { in: dto.roles.map((r) => r.roleId) } },
            select: { id: true, name: true },
        });
        const roleNameById = new Map(roles.map((r) => [r.id, r.name]));

        for (const item of dto.roles) {
            const roleName = roleNameById.get(item.roleId);
            if (!roleName) {
                throw new BadRequestException(`El rol ${item.roleId} no existe`);
            }
            if (roleName === 'Administrador' && !item.countryCode) {
                throw new BadRequestException('El rol Administrador requiere un país asignado');
            }
        }

        const countryCodes = [
            ...new Set(
                dto.roles
                    .map((r) => r.countryCode?.toLowerCase())
                    .filter((c): c is string => Boolean(c)),
            ),
        ];
        const countries = await this.prisma.country.findMany({
            where: { code: { in: countryCodes } },
            select: { id: true, code: true },
        });
        const countryIdByCode = new Map(countries.map((c) => [c.code, c.id]));

        for (const code of countryCodes) {
            if (!countryIdByCode.has(code)) {
                throw new BadRequestException(`El país ${code} no existe`);
            }
        }

        await this.prisma.$transaction([
            this.prisma.userRole.deleteMany({ where: { userId } }),
            this.prisma.userRole.createMany({
                data: dto.roles.map((item) => ({
                    userId,
                    roleId: item.roleId,
                    countryId: item.countryCode
                        ? (countryIdByCode.get(item.countryCode.toLowerCase()) ?? null)
                        : null,
                })),
                skipDuplicates: true,
            }),
        ]);

        return this.findById(userId);
    }

    async delete(id: string, requesterId: string, requesterRoles: string[]) {
        const esAdmin = requesterRoles.some((r) => ['admin', 'SuperAdministrador', 'Administrador'].includes(r));
        if (id !== requesterId && !esAdmin) {
            throw new ForbiddenException('No tienes permiso para eliminar esta cuenta');
        }
        await this.findById(id);
        return this.prisma.user.delete({ where: { id }, select: { id: true } });
    }
}
