import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateCountryDto {
    @ApiPropertyOptional({ example: true, description: 'Habilitar o deshabilitar la pasarela de pagos para el país' })
    @IsOptional()
    @IsBoolean()
    paymentsEnabled?: boolean;
}
