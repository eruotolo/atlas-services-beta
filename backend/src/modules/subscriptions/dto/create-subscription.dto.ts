import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

const VALID_DURATIONS = [1, 3, 6, 9, 12] as const;

export class CreateSubscriptionDto {
    @ApiProperty({ description: 'ID del servicio a suscribir' })
    @IsUUID()
    serviceId: string;

    @ApiProperty({ enum: VALID_DURATIONS })
    @IsInt()
    @IsIn(VALID_DURATIONS)
    durationMonths: number;

    @ApiPropertyOptional({ example: 'webpay' })
    @IsOptional()
    @IsString()
    paymentMethod?: string;
}
