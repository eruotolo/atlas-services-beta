import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import type { CreateCountryDto } from './dto/create-country.dto';
import type { UpdateCountryDto } from './dto/update-country.dto';

const COUNTRY_SELECT = {
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
    active: true,
} as const;

@Injectable()
export class GeoService {
    constructor(private readonly prisma: PrismaService) {}

    findAllCountries() {
        return this.prisma.country.findMany({
            where: { active: true },
            orderBy: { name: 'asc' },
            select: COUNTRY_SELECT,
        });
    }

    findAllCountriesAdmin() {
        return this.prisma.country.findMany({
            orderBy: { name: 'asc' },
            select: COUNTRY_SELECT,
        });
    }

    async findCountryByCode(code: string) {
        const country = await this.prisma.country.findUnique({
            where: { code },
            select: COUNTRY_SELECT,
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
            select: { id: true, code: true, name: true },
        });
    }

    findLocalitiesByRegion(regionId: string) {
        return this.prisma.geoLocality.findMany({
            where: { regionId, active: true },
            orderBy: { name: 'asc' },
            select: { id: true, slug: true, name: true },
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
                region: { select: { name: true, code: true } },
            },
        });
    }

    async createCountry(data: CreateCountryDto) {
        const existing = await this.prisma.country.findUnique({ where: { code: data.code } });
        if (existing) throw new ConflictException(`El código de país "${data.code}" ya existe`);

        return this.prisma.country.create({
            data: {
                code: data.code,
                name: data.name,
                currency: data.currency,
                locale: data.locale,
                timezone: data.timezone,
                gateway: data.gateway,
                regionLabel: data.regionLabel,
                localityLabel: data.localityLabel,
                paymentsEnabled: data.paymentsEnabled ?? true,
            },
            select: COUNTRY_SELECT,
        });
    }

    async updateCountry(code: string, data: UpdateCountryDto) {
        const country = await this.prisma.country.findUnique({ where: { code } });
        if (!country) throw new NotFoundException(`País "${code}" no encontrado`);

        return this.prisma.country.update({
            where: { code },
            data,
            select: COUNTRY_SELECT,
        });
    }
}
