import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceLevel } from '@prisma/client';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsBoolean,
    IsDateString,
    IsEmail,
    IsEnum,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
    IsUrl,
    MaxLength,
    MinLength,
    ValidateNested,
} from 'class-validator';

export class RedesSocialesDto {
    @ApiProperty({ example: 'INSTAGRAM' })
    @IsString()
    tipo: string;

    @ApiProperty({ example: 'https://instagram.com/mi-servicio' })
    @IsString()
    url: string;
}

export class CreateServiceDto {
    @ApiProperty({ example: 'Electricista en Castro' })
    @IsString()
    @MinLength(5)
    @MaxLength(100)
    titulo: string;

    @ApiPropertyOptional({ example: 'electricista-en-castro' })
    @IsOptional()
    @IsString()
    @MinLength(5)
    @MaxLength(120)
    slug?: string;

    @ApiProperty()
    @IsString()
    @MinLength(20)
    descripcion: string;

    @ApiProperty({ example: 25000 })
    @IsNumber()
    @IsPositive()
    precio: number;

    @ApiProperty({ example: 'Castro' })
    @IsString()
    @MaxLength(100)
    comuna: string;

    @ApiProperty({ example: ['uuid-categoria-1'] })
    @IsArray()
    @IsString({ each: true })
    categoriaIds: string[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(100)
    nombreContacto?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsEmail()
    emailContacto?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(20)
    telefonoContacto?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUrl()
    imagenPrincipal?: string;

    @ApiPropertyOptional({ type: [String] })
    @IsOptional()
    @IsArray()
    @IsUrl({}, { each: true })
    imagenes?: string[];

    @ApiPropertyOptional({ enum: ServiceLevel, default: ServiceLevel.BASIC })
    @IsOptional()
    @IsEnum(ServiceLevel)
    nivel?: ServiceLevel;

    @ApiPropertyOptional({ example: '2026-12-31' })
    @IsOptional()
    @IsDateString()
    fechaFin?: string;

    @ApiPropertyOptional({ default: false })
    @IsOptional()
    @IsBoolean()
    destacado?: boolean;

    @ApiPropertyOptional({ type: [RedesSocialesDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => RedesSocialesDto)
    redesSociales?: RedesSocialesDto[];

    @ApiProperty({ description: 'Código de país ISO', example: 'cl' })
    @IsString()
    @MaxLength(10)
    countryCode: string;

    @ApiPropertyOptional({ description: 'Código de región', example: 'LL' })
    @IsOptional()
    @IsString()
    @MaxLength(20)
    regionCode?: string;

    @ApiPropertyOptional({ description: 'Slug de localidad', example: 'castro' })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    localitySlug?: string;
}
