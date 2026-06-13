import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SponsorCategory } from '@prisma/client';
import {
    IsBoolean,
    IsDateString,
    IsEnum,
    IsOptional,
    IsString,
    IsUrl,
    MaxLength,
} from 'class-validator';

export class CreateSponsorDto {
    @ApiProperty()
    @IsString()
    @MaxLength(100)
    nombre: string;

    @ApiProperty({ enum: SponsorCategory })
    @IsEnum(SponsorCategory)
    nivel: SponsorCategory;

    @ApiProperty()
    @IsUrl()
    imagenUrl: string;

    @ApiProperty()
    @IsUrl()
    linkExterno: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    descripcion?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    fechaInicio?: string;

    @ApiProperty()
    @IsDateString()
    fechaFin: string;

    @ApiPropertyOptional({ default: true })
    @IsOptional()
    @IsBoolean()
    activo?: boolean;

    @ApiPropertyOptional({
        description: 'Código de país donde se publica; null/omitido = global',
        example: 'cl',
        nullable: true,
    })
    @IsOptional()
    @IsString()
    countryCode?: string | null;
}
