import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@common/decorators/current-user.decorator';
import { Roles } from '@common/decorators/roles.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';

import { CreateRatingDto } from './dto/create-rating.dto';
import { QueryRatingsDto } from './dto/query-ratings.dto';
import { ReplyRatingDto } from './dto/reply-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { RatingsService } from './ratings.service';

@ApiTags('ratings')
@Controller()
export class RatingsController {
    constructor(private readonly service: RatingsService) {}

    @Get('ratings')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Listar todas las calificaciones (admin)' })
    findAll(@Query() query: QueryRatingsDto) {
        return this.service.findAll(query);
    }

    @Get('services/:serviceId/ratings')
    @ApiOperation({ summary: 'Listar calificaciones de un servicio' })
    findByServicio(@Param('serviceId') serviceId: string) {
        return this.service.findByServicio(serviceId);
    }

    @Post('services/:serviceId/ratings')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Calificar un servicio (1 por usuario)' })
    create(
        @Param('serviceId') serviceId: string,
        @Body() dto: CreateRatingDto,
        @CurrentUser() user: { id: string },
    ) {
        return this.service.create(serviceId, dto, user.id);
    }

    @Patch('ratings/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Editar calificación (admin)' })
    update(@Param('id') id: string, @Body() dto: UpdateRatingDto) {
        return this.service.update(id, dto);
    }

    @Delete('ratings/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Eliminar calificación propia o como admin' })
    remove(@Param('id') id: string, @CurrentUser() user: { id: string; roles: string[] }) {
        return this.service.delete(id, user.id, user.roles);
    }

    @Patch('services/:serviceId/ratings/:ratingId/reply')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Responder a una reseña (solo dueño del servicio)' })
    reply(
        @Param('serviceId') serviceId: string,
        @Param('ratingId') ratingId: string,
        @Body() dto: ReplyRatingDto,
        @CurrentUser() user: { id: string },
    ) {
        return this.service.replyToRating(ratingId, serviceId, user.id, dto.respuesta);
    }
}
