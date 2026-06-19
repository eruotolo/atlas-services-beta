import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentGateway } from '@prisma/client';
import { IsBoolean, IsEnum, IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class UpdateCountryDto {
    @ApiPropertyOptional({ example: 'Chile' })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    name?: string;

    @ApiPropertyOptional({ example: 'CLP' })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    currency?: string;

    @ApiPropertyOptional({ example: 'es-CL' })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    locale?: string;

    @ApiPropertyOptional({ example: 'America/Santiago' })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    timezone?: string;

    @ApiPropertyOptional({ enum: PaymentGateway, example: 'MERCADOPAGO' })
    @IsOptional()
    @IsEnum(PaymentGateway)
    gateway?: PaymentGateway;

    @ApiPropertyOptional({ example: 'Región' })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    regionLabel?: string;

    @ApiPropertyOptional({ example: 'Comuna' })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    localityLabel?: string;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    paymentsEnabled?: boolean;

    @ApiPropertyOptional({ example: true, description: 'Activar o desactivar el país en la plataforma' })
    @IsOptional()
    @IsBoolean()
    active?: boolean;
}
