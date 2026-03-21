import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { CountryDto } from './dto/country.dto';
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
}
