import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateServiceRequestDto {
    @ApiProperty({ description: 'ID de la categoría del servicio' })
    @IsString()
    @IsNotEmpty()
    categoryId: string;

    @ApiProperty({ description: 'Descripción del problema o requerimiento' })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({ description: 'Nivel de urgencia' })
    @IsString()
    @IsNotEmpty()
    urgency: string;
}
