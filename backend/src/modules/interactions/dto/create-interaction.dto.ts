import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InteractionType } from '@prisma/client';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export class CreateInteractionDto {
    @ApiProperty({ enum: InteractionType })
    @IsEnum(InteractionType)
    tipo: InteractionType;

    @ApiProperty()
    @IsUUID()
    serviceId: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    usuarioId?: string;
}
