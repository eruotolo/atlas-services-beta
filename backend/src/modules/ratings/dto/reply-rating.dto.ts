import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class ReplyRatingDto {
    @ApiProperty({ description: 'Respuesta del profesional a la reseña', maxLength: 1000 })
    @IsString()
    @MinLength(5)
    @MaxLength(1000)
    respuesta: string;
}
