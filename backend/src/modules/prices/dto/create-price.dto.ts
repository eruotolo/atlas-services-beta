import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsInt, IsNumber, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator';

const DURACIONES_VALIDAS = [1, 3, 6, 9, 12] as const;

export class CreatePriceDto {
    @ApiProperty({ description: 'ID del país al que pertenece este precio' })
    @IsUUID()
    countryId: string;

    @ApiProperty({ enum: DURACIONES_VALIDAS })
    @IsInt()
    @IsIn(DURACIONES_VALIDAS)
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
