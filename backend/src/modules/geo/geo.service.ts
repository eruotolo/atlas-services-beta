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
}
