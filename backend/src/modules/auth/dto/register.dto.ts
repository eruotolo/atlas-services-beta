import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsEmail,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';

export class RegisterDto {
    @ApiProperty({ example: 'Juan Pérez' })
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    nombre: string;

    @ApiProperty({ example: 'juan@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'MiContraseña123', minLength: 8 })
    @IsString()
    @MinLength(8)
    @MaxLength(100)
    password: string;

    @ApiPropertyOptional({ example: '+56912345678' })
    @IsOptional()
    @IsString()
    @MaxLength(20)
    telefono?: string;
}
