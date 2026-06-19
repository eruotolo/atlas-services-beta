import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNumber, IsOptional, IsPositive, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreatePriceDto {
    @ApiProperty({ description: 'ID del país al que pertenece este precio' })
    @IsUUID()
    countryId: string;

    @ApiProperty({ description: 'Duración en meses (1–12)', minimum: 1, maximum: 12 })
    @IsInt()
    @Min(1)
    @Max(12)
    duracionMeses: number;

    @ApiProperty({ example: 9990 })
    @IsNumber()
    @IsPositive()
    precio: number;

    @ApiProperty({ example: 'CLP', description: 'Moneda ISO 4217' })
    @IsString()
    currency: string;

    @ApiPropertyOptional({ example: '1 mes de servicio premium' })
    @IsOptional()
    @IsString()
    descripcion?: string;

    @ApiPropertyOptional({ default: true })
    @IsOptional()
    @IsBoolean()
    activo?: boolean;
}
