import { ApiProperty } from '@nestjs/swagger';
import type { PaymentGateway } from '@prisma/client';

export class CountryDto {
    @ApiProperty({ example: 'uuid-here' })
    id: string;

    @ApiProperty({ example: 'cl', description: 'Código ISO2 en minúsculas' })
    code: string;

    @ApiProperty({ example: 'Chile' })
    name: string;

    @ApiProperty({ example: 'CLP', description: 'Código de moneda ISO 4217' })
    currency: string;

    @ApiProperty({ example: 'es-CL' })
    locale: string;

    @ApiProperty({ example: 'America/Santiago' })
    timezone: string;

    @ApiProperty({ enum: ['MERCADOPAGO', 'STRIPE'], example: 'MERCADOPAGO' })
    gateway: PaymentGateway;

    @ApiProperty({ example: 'Región', description: 'Etiqueta de la división administrativa nivel 1' })
    regionLabel: string;

    @ApiProperty({ example: 'Comuna', description: 'Etiqueta de la división administrativa nivel 2' })
    localityLabel: string;

    @ApiProperty({ example: true, description: 'Indica si la pasarela de pagos está activa en este país' })
    paymentsEnabled: boolean;

    @ApiProperty({ example: true, description: 'Indica si el país está activo en la plataforma' })
    active: boolean;
}
