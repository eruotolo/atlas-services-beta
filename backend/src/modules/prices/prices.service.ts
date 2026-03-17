import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import type { CreatePriceDto } from './dto/create-price.dto';

const PRICE_SELECT = {
    id: true,
    durationMonths: true,
    price: true,
    description: true,
    active: true,
} as const;

@Injectable()
export class PricesService {
    constructor(private readonly prisma: PrismaService) {}

    findAll() {
        return this.prisma.premiumPrice.findMany({
            where: { active: true },
            orderBy: { durationMonths: 'asc' },
            select: PRICE_SELECT,
        });
    }

    async findById(id: string) {
        const price = await this.prisma.premiumPrice.findUnique({
            where: { id },
            select: PRICE_SELECT,
        });
        if (!price) throw new NotFoundException(`Precio ${id} no encontrado`);
        return price;
    }

    findByDuracion(durationMonths: number) {
        return this.prisma.premiumPrice.findUnique({
            where: { durationMonths },
            select: PRICE_SELECT,
        });
    }

    create(dto: CreatePriceDto) {
        return this.prisma.premiumPrice.create({
            data: {
                durationMonths: dto.duracionMeses,
                price: dto.precio,
                description: dto.descripcion,
                active: dto.activo,
            },
            select: PRICE_SELECT,
        });
    }

    async update(id: string, dto: Partial<CreatePriceDto>) {
        await this.findById(id);
        return this.prisma.premiumPrice.update({
            where: { id },
            data: {
                ...(dto.duracionMeses !== undefined && { durationMonths: dto.duracionMeses }),
                ...(dto.precio !== undefined && { price: dto.precio }),
                ...(dto.descripcion !== undefined && { description: dto.descripcion }),
                ...(dto.activo !== undefined && { active: dto.activo }),
            },
            select: PRICE_SELECT,
        });
    }

    async delete(id: string) {
        await this.findById(id);
        return this.prisma.premiumPrice.delete({
            where: { id },
            select: { id: true },
        });
    }
}
