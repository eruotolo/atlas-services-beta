import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import type { CreatePriceDto } from './dto/create-price.dto';

const PRICE_SELECT = {
    id: true,
    durationMonths: true,
    price: true,
    currency: true,
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
        // Compatibilidad backward: busca por durationMonths sin filtro de país
        return this.prisma.premiumPrice.findFirst({
            where: { durationMonths, active: true },
            select: PRICE_SELECT,
        });
    }

    async findByCountryAndDuration(countryId: string, durationMonths: number) {
        return this.prisma.premiumPrice.findUnique({
            where: { countryId_durationMonths: { countryId, durationMonths } },
            select: PRICE_SELECT,
        });
    }

    async findAllByCountry(countryCode: string) {
        const country = await this.prisma.country.findUnique({
            where: { code: countryCode.toLowerCase() },
            select: { id: true },
        });
        if (!country) return [];

        return this.prisma.premiumPrice.findMany({
            where: { countryId: country.id, active: true },
            orderBy: { durationMonths: 'asc' },
            select: PRICE_SELECT,
        });
    }

    create(dto: CreatePriceDto) {
        return this.prisma.premiumPrice.create({
            data: {
                countryId: dto.countryId,
                durationMonths: dto.duracionMeses,
                price: dto.precio,
                currency: dto.currency,
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
                ...(dto.currency !== undefined && { currency: dto.currency }),
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
