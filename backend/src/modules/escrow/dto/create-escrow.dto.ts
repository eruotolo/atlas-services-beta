import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEscrowPaymentDto {
    @ApiProperty({ description: 'ID de la cotización que se va a pagar' })
    @IsString()
    @IsNotEmpty()
    quoteId: string;
}
