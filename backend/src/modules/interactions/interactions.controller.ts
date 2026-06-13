import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@common/decorators/current-user.decorator';
import { Roles } from '@common/decorators/roles.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';

import { CreateInteractionDto } from './dto/create-interaction.dto';
import { InteractionsService } from './interactions.service';

@ApiTags('interactions')
@Controller()
export class InteractionsController {
    constructor(private readonly service: InteractionsService) {}

    @Post('interactions')
    @ApiOperation({ summary: 'Registrar interacción con un servicio' })
    create(@Body() dto: CreateInteractionDto) {
        return this.service.create(dto);
    }

    @Get('interactions')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Listar interacciones paginadas (admin)' })
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
        return this.service.findAllPaginated(
            page ? parseInt(page, 10) : 1,
            limit ? parseInt(limit, 10) : 20,
            query,
            countryCode,
        );
    }

    @Get('interactions/metrics')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Métricas de interacciones, global o por país (admin)' })
    @ApiQuery({ name: 'countryCode', required: false, type: String, example: 'cl' })
    getMetricas(@Query('countryCode') countryCode?: string) {
        return this.service.getMetricas(countryCode);
    }

    @Get('services/:serviceId/stats')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Estadísticas de interacciones (dueño o admin)' })
    estadisticas(
        @Param('serviceId') serviceId: string,
        @CurrentUser() user: { id: string; roles: string[] },
    ) {
        return this.service.estadisticas(serviceId, user.id, user.roles);
    }
}
