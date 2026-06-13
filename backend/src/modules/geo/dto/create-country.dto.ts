import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentGateway } from '@prisma/client';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator';

export class CreateCountryDto {
    @ApiProperty({ example: 'cl', description: 'Código ISO2 en minúsculas' })
    @IsString()
    @IsNotEmpty()
    @Length(2, 2)
    @Matches(/^[a-z]{2}$/, { message: 'El código debe ser ISO2 en minúsculas (ej: cl, ar)' })
    code: string;

    @ApiProperty({ example: 'Chile' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'CLP', description: 'Código de moneda ISO 4217' })
    @IsString()
    @IsNotEmpty()
    currency: string;

    @ApiProperty({ example: 'es-CL' })
    @IsString()
    @IsNotEmpty()
    locale: string;

    @ApiProperty({ example: 'America/Santiago' })
    @IsString()
    @IsNotEmpty()
    timezone: string;

    @ApiProperty({ enum: PaymentGateway, example: 'MERCADOPAGO' })
    @IsEnum(PaymentGateway)
    gateway: PaymentGateway;

    @ApiProperty({ example: 'Región', description: 'Etiqueta de la división administrativa nivel 1' })
    @IsString()
    @IsNotEmpty()
    regionLabel: string;

    @ApiProperty({ example: 'Comuna', description: 'Etiqueta de la división administrativa nivel 2' })
    @IsString()
    @IsNotEmpty()
    localityLabel: string;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    paymentsEnabled?: boolean;

    @ApiPropertyOptional({ example: true, description: 'Activar o desactivar el país en la plataforma' })
    @IsOptional()
    @IsBoolean()
    active?: boolean;
}
