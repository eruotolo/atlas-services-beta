import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuoteDto {
    @ApiProperty({ description: 'ID del ServiceRequest al que se le está enviando la cotización' })
    @IsString()
    @IsNotEmpty()
    serviceRequestId: string;

    @ApiProperty({ description: 'Precio ofrecido por el profesional' })
    @IsNumber()
    @Min(0)
    price: number;

    @ApiProperty({ description: 'Mensaje descriptivo de la propuesta' })
    @IsString()
    @IsNotEmpty()
    message: string;
}
