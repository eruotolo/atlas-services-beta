import { ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceLevel } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class QueryServicesDto {
    @ApiPropertyOptional({ description: 'Búsqueda de texto en título, descripción y nombre de usuario' })
    @IsOptional()
    @IsString()
    query?: string;

    @ApiPropertyOptional({ description: 'Filtrar por nombre de categoría' })
    @IsOptional()
    @IsString()
    category?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    comuna?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    categoriaSlug?: string;

    @ApiPropertyOptional({ enum: ServiceLevel })
    @IsOptional()
    @IsEnum(ServiceLevel)
    nivel?: ServiceLevel;

    @ApiPropertyOptional()
    @IsOptional()
    @Transform(({ value }: { value: string }) => value === 'true')
    @IsBoolean()
    destacado?: boolean;

    @ApiPropertyOptional({ default: 1 })
    @IsOptional()
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ default: 20 })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 20;

    @ApiPropertyOptional({ description: 'Filtrar por código de país', example: 'cl' })
    @IsOptional()
    @IsString()
    countryCode?: string;

    @ApiPropertyOptional({ description: 'Filtrar por código de región', example: 'LL' })
    @IsOptional()
    @IsString()
    regionCode?: string;

    @ApiPropertyOptional({ description: 'Filtrar por slug de localidad', example: 'castro' })
    @IsOptional()
    @IsString()
    localitySlug?: string;
}
