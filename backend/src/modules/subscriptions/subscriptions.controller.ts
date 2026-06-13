import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@common/decorators/current-user.decorator';
import { Roles } from '@common/decorators/roles.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { WebhookGuard } from '@common/guards/webhook.guard';

import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { SubscriptionsService } from './subscriptions.service';

@ApiTags('subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
    constructor(private readonly service: SubscriptionsService) {}

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Historial de pagos paginado con stats (admin)' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'countryCode', required: false, type: String, example: 'cl' })
    @ApiQuery({ name: 'startDate', required: false, type: String, example: '2026-06-01' })
    @ApiQuery({ name: 'endDate', required: false, type: String, example: '2026-06-30' })
    findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('countryCode') countryCode?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return this.service.findAllPaginated({
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 10,
            countryCode,
            startDate,
            endDate,
        });
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Detalle de suscripción (dueño o admin)' })
    findOne(
        @Param('id') id: string,
        @CurrentUser() user: { id: string; roles: string[] },
    ) {
        return this.service.findById(id, user.id, user.roles);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Iniciar suscripción premium' })
    create(@Body() dto: CreateSubscriptionDto, @CurrentUser() user: { id: string }) {
        return this.service.create(dto, user.id);
    }

    @Patch(':id/webhook')
    @UseGuards(WebhookGuard)
    @ApiOperation({ summary: 'Actualizar estado de pago (webhook pasarela)' })
    updatePaymentStatus(
        @Param('id') id: string,
        @Body() body: { estadoPago: string; transaccionId?: string },
    ) {
        return this.service.actualizarEstadoPago(id, body.estadoPago, body.transaccionId);
    }
}
