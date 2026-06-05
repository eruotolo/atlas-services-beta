import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';

import { CountryDto } from './dto/country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { GeoLocalityDto } from './dto/geo-locality.dto';
import { GeoRegionDto } from './dto/geo-region.dto';
import { GeoService } from './geo.service';

@ApiTags('geo')
@Controller('geo')
export class GeoController {
    constructor(private readonly geoService: GeoService) {}

    @Get('countries')
    @ApiOperation({ summary: 'Listar todos los países activos' })
    @ApiOkResponse({ type: [CountryDto] })
    findAllCountries() {
        return this.geoService.findAllCountries();
    }

    @Get('countries/:code')
    @ApiOperation({ summary: 'Obtener un país por código' })
    @ApiParam({ name: 'code', example: 'cl' })
    @ApiOkResponse({ type: CountryDto })
    findCountryByCode(@Param('code') code: string) {
        return this.geoService.findCountryByCode(code);
    }

    @Get('countries/:code/regions')
    @ApiOperation({ summary: 'Listar regiones de un país' })
    @ApiParam({ name: 'code', example: 'cl' })
    @ApiOkResponse({ type: [GeoRegionDto] })
    findRegionsByCountry(@Param('code') code: string) {
        return this.geoService.findRegionsByCountry(code);
    }

    @Get('regions/:regionId/localities')
    @ApiOperation({ summary: 'Listar localidades de una región' })
    @ApiParam({ name: 'regionId', description: 'UUID de la región' })
    @ApiOkResponse({ type: [GeoLocalityDto] })
    findLocalitiesByRegion(@Param('regionId') regionId: string) {
        return this.geoService.findLocalitiesByRegion(regionId);
    }

    @Get('countries/:code/localities/search')
    @ApiOperation({ summary: 'Buscar localidades en todo el país' })
    @ApiParam({ name: 'code', example: 'cl' })
    @ApiOkResponse({ type: [GeoLocalityDto] })
    searchLocalitiesByCountry(@Param('code') code: string) {
        return this.geoService.searchLocalitiesByCountry(code);
    }

    @Patch('countries/:code')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPER_ADMIN')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Actualizar configuración de un país (Super Admin)' })
    @ApiParam({ name: 'code', example: 'uy' })
    @ApiOkResponse({ type: CountryDto })
    updateCountry(@Param('code') code: string, @Body() updateCountryDto: UpdateCountryDto) {
        return this.geoService.updateCountry(code, updateCountryDto);
    }
}
