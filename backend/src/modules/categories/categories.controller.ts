import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

import { Roles } from '@common/decorators/roles.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';

import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
    constructor(private readonly service: CategoriesService) {}

    @Get()
    @ApiOperation({ summary: 'Listar categorías activas (globales + las del país si se pasa countryCode)' })
    @ApiQuery({ name: 'countryCode', required: false, type: String, example: 'cl' })
    findAll(@Query('countryCode') countryCode?: string) {
        return this.service.findAll(countryCode);
    }

    @Get('admin')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Listar todas las categorías paginadas (admin)' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'query', required: false, type: String })
    findAllAdmin(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('query') query?: string,
    ) {
        return this.service.findAllPaginated(
            page ? parseInt(page, 10) : 1,
            limit ? parseInt(limit, 10) : 12,
            query,
        );
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Crear categoría (admin)' })
    create(@Body() dto: CreateCategoryDto) {
        return this.service.create(dto);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Editar categoría (admin)' })
    update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Eliminar categoría (admin)' })
    remove(@Param('id') id: string) {
        return this.service.delete(id);
    }
}
