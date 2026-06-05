import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GeoService {
    constructor(private readonly prisma: PrismaService) {}

    findAllCountries() {
        return this.prisma.country.findMany({
            where: { active: true },
            orderBy: { name: 'asc' },
            select: {
                id: true,
                code: true,
                name: true,
                currency: true,
                locale: true,
                timezone: true,
                gateway: true,
                regionLabel: true,
                localityLabel: true,
                paymentsEnabled: true,
            },
        });
    }

    async findCountryByCode(code: string) {
        const country = await this.prisma.country.findUnique({
            where: { code },
            select: {
                id: true,
                code: true,
                name: true,
                currency: true,
                locale: true,
                timezone: true,
                gateway: true,
                regionLabel: true,
                localityLabel: true,
                active: true,
                paymentsEnabled: true,
            },
        });
        if (!country) throw new NotFoundException(`País "${code}" no encontrado`);
        return country;
    }

    async findRegionsByCountry(countryCode: string) {
        const country = await this.prisma.country.findUnique({
            where: { code: countryCode },
            select: { id: true },
        });
        if (!country) throw new NotFoundException(`País "${countryCode}" no encontrado`);

        return this.prisma.geoRegion.findMany({
            where: { countryId: country.id, active: true },
            orderBy: { name: 'asc' },
            select: {
                id: true,
                code: true,
                name: true,
            },
        });
    }

    findLocalitiesByRegion(regionId: string) {
        return this.prisma.geoLocality.findMany({
            where: { regionId, active: true },
            orderBy: { name: 'asc' },
            select: {
                id: true,
                slug: true,
                name: true,
            },
        });
    }

    async searchLocalitiesByCountry(countryCode: string) {
        return this.prisma.geoLocality.findMany({
            where: {
                region: { country: { code: countryCode } },
                active: true,
            },
            orderBy: { name: 'asc' },
            select: {
                id: true,
                slug: true,
                name: true,
                region: {
                    select: { name: true, code: true }
                }
            },
        });
    }

    async updateCountry(code: string, data: { paymentsEnabled?: boolean }) {
        const country = await this.prisma.country.findUnique({ where: { code } });
        if (!country) throw new NotFoundException(`País "${code}" no encontrado`);

        return this.prisma.country.update({
            where: { code },
            data,
            select: {
                id: true,
                code: true,
                name: true,
                currency: true,
                locale: true,
                timezone: true,
                gateway: true,
                regionLabel: true,
                localityLabel: true,
                active: true,
                paymentsEnabled: true,
            },
        });
    }
}
