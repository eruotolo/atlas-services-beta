import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { WebhookGuard } from '@common/guards/webhook.guard';

import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { SubscriptionsService } from './subscriptions.service';

@ApiTags('subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
    constructor(private readonly service: SubscriptionsService) {}

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
