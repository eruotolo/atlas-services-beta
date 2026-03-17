import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCategoryDto {
    @ApiProperty({ example: 'Electricista' })
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    nombre: string;

    @ApiProperty({ example: 'electricista' })
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    slug: string;

    @ApiPropertyOptional({ example: 'Zap' })
    @IsOptional()
    @IsString()
    icono?: string;

    @ApiPropertyOptional({ default: 0 })
    @IsOptional()
    @IsInt()
    orden?: number;

    @ApiPropertyOptional({ default: true })
    @IsOptional()
    @IsBoolean()
    activo?: boolean;
}
