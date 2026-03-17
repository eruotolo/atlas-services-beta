import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsInt, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

const DURACIONES_VALIDAS = [1, 3, 6, 9, 12] as const;

export class CreatePriceDto {
    @ApiProperty({ enum: DURACIONES_VALIDAS })
    @IsInt()
    @IsIn(DURACIONES_VALIDAS)
    duracionMeses: number;

    @ApiProperty({ example: 9990 })
    @IsNumber()
    @IsPositive()
    precio: number;

    @ApiPropertyOptional({ example: '1 mes de servicio premium' })
    @IsOptional()
    @IsString()
    descripcion?: string;

    @ApiPropertyOptional({ default: true })
    @IsOptional()
    @IsBoolean()
    activo?: boolean;
}
