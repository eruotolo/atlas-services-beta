import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';

import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(private readonly service: UsersService) {}

    @Get()
    @ApiOperation({ summary: 'Listar usuarios con paginación y búsqueda' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'query', required: false, type: String })
    findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('query') query?: string,
    ) {
        return this.service.findAll(page ? Number(page) : 1, limit ? Number(limit) : 10, query);
    }

    @Get('roles')
    @ApiOperation({ summary: 'Listar roles disponibles' })
    findRoles() {
        return this.service.findRoles();
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Perfil del usuario autenticado' })
    findMe(@CurrentUser() user: { id: string }) {
        return this.service.findMe(user.id);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Perfil público de un usuario' })
    findOne(@Param('id') id: string) {
        return this.service.findById(id);
    }

    @Get(':id/services')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Servicios propios del usuario' })
    findUserServices(@Param('id') id: string) {
        return this.service.findUserServices(id);
    }

    @Patch('me/password')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Cambiar contraseña del usuario autenticado' })
    updatePassword(
        @Body() dto: UpdatePasswordDto,
        @CurrentUser() user: { id: string },
    ) {
        return this.service.updatePassword(user.id, dto);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Actualizar perfil propio' })
    update(
        @Param('id') id: string,
        @Body() dto: UpdateUserDto,
        @CurrentUser() user: { id: string },
    ) {
        return this.service.update(id, dto, user.id);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Eliminar cuenta' })
    remove(
        @Param('id') id: string,
        @CurrentUser() user: { id: string; roles: string[] },
    ) {
        return this.service.delete(id, user.id, user.roles);
    }
}
