import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

import { Roles } from '@common/decorators/roles.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';

import { CreateSponsorDto } from './dto/create-sponsor.dto';
import { UpdateSponsorDto } from './dto/update-sponsor.dto';
import { SponsorsService } from './sponsors.service';

@ApiTags('sponsors')
@Controller('sponsors')
export class SponsorsController {
    constructor(private readonly service: SponsorsService) {}

    @Get()
    @ApiOperation({ summary: 'Listar sponsors activos (globales + los del país si se pasa countryCode)' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'query', required: false, type: String })
    @ApiQuery({ name: 'countryCode', required: false, type: String, example: 'cl' })
    findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('query') query?: string,
        @Query('countryCode') countryCode?: string,
    ) {
        // If query parameters for pagination exist, return paginated results
        if (page || limit || query) {
            return this.service.findAllPaginated(
                page ? Number(page) : 1,
                limit ? Number(limit) : 10,
                query
            );
        }
        // Otherwise return the flat list filtered by country (e.g. for the landing page)
        return this.service.findAll(countryCode);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Crear sponsor (admin)' })
    create(@Body() dto: CreateSponsorDto) {
        return this.service.create(dto);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Editar sponsor (admin)' })
    update(@Param('id') id: string, @Body() dto: UpdateSponsorDto) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Eliminar sponsor (admin)' })
    remove(@Param('id') id: string) {
        return this.service.delete(id);
    }
}
