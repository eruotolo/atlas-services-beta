import { Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';

import { FavoritesService } from './favorites.service';

@ApiTags('favorites')
@Controller('users/me/favorites')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class FavoritesController {
    constructor(private readonly service: FavoritesService) {}

    @Get()
    @ApiOperation({ summary: 'Listar servicios favoritos del usuario' })
    findAll(@CurrentUser() user: { id: string }) {
        return this.service.getFavorites(user.id);
    }

    @Get(':serviceId/check')
    @ApiOperation({ summary: 'Verificar si un servicio es favorito' })
    check(
        @Param('serviceId') serviceId: string,
        @CurrentUser() user: { id: string },
    ) {
        return this.service.isFavorite(user.id, serviceId);
    }

    @Post(':serviceId')
    @ApiOperation({ summary: 'Agregar servicio a favoritos' })
    add(
        @Param('serviceId') serviceId: string,
        @CurrentUser() user: { id: string },
    ) {
        return this.service.addFavorite(user.id, serviceId);
    }

    @Delete(':serviceId')
    @ApiOperation({ summary: 'Quitar servicio de favoritos' })
    remove(
        @Param('serviceId') serviceId: string,
        @CurrentUser() user: { id: string },
    ) {
        return this.service.removeFavorite(user.id, serviceId);
    }
}
