import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SponsorCategory } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

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

    @ApiProperty()
    @IsDateString()
    fechaFin: string;
}
