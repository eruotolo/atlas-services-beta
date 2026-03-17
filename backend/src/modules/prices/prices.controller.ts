import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Roles } from '@common/decorators/roles.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';

import { CreatePriceDto } from './dto/create-price.dto';
import { PricesService } from './prices.service';

@ApiTags('prices')
@Controller('prices')
export class PricesController {
    constructor(private readonly service: PricesService) {}

    @Get()
    @ApiOperation({ summary: 'Listar precios premium activos' })
    findAll() {
        return this.service.findAll();
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('superadmin')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Crear precio premium (superadmin)' })
    create(@Body() dto: CreatePriceDto) {
        return this.service.create(dto);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('superadmin')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Editar precio premium (superadmin)' })
    update(@Param('id') id: string, @Body() dto: Partial<CreatePriceDto>) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('superadmin')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Eliminar precio premium (superadmin)' })
    remove(@Param('id') id: string) {
        return this.service.delete(id);
    }
}
