import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '@common/decorators/roles.decorator';
import { RolesGuard } from '@common/guards/roles.guard';


import { CurrentUser } from '@common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';

import { CreateServiceDto } from './dto/create-service.dto';
import { QueryServicesDto } from './dto/query-services.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServicesService } from './services.service';

@ApiTags('services')
@Controller('services')
export class ServicesController {
    constructor(private readonly service: ServicesService) {}

    @Get()
    @ApiOperation({ summary: 'Listar servicios con filtros y paginación' })
    findAll(@Query() query: QueryServicesDto) {
        return this.service.findAll(query);
    }

    @Get(':slug')
    @ApiOperation({ summary: 'Detalle de servicio por slug' })
    findOne(@Param('slug') slug: string) {
        return this.service.findBySlug(slug);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Crear servicio' })
    create(@Body() dto: CreateServiceDto, @CurrentUser() user: { id: string }) {
        return this.service.create(dto, user.id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Editar servicio propio' })
    update(
        @Param('id') id: string,
        @Body() dto: UpdateServiceDto,
        @CurrentUser() user: { id: string },
    ) {
        return this.service.update(id, dto, user.id);
    }

    @Patch(':id/toggle-owner')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Toggle activo del servicio propio' })
    toggleActiveOwner(@Param('id') id: string, @CurrentUser() user: { id: string }) {
        return this.service.toggleActiveOwner(id, user.id);
    }

    @Patch(':id/active')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Toggle activo del servicio (admin)' })
    toggleActive(@Param('id') id: string) {
        return this.service.toggleActive(id);
    }

    @Patch(':id/featured')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Toggle destacado del servicio (admin)' })
    toggleFeatured(@Param('id') id: string) {
        return this.service.toggleFeatured(id);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Eliminar servicio propio' })
    remove(@Param('id') id: string, @CurrentUser() user: { id: string; roles: string[] }) {
        return this.service.delete(id, user.id, user.roles);
    }
}
