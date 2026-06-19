import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendPushNotificationDto {
    @ApiProperty({ description: 'ID del usuario destino (para extraer su fcmToken)' })
    @IsString()
    @IsNotEmpty()
    userId: string;

    @ApiProperty({ description: 'Título de la notificación' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ description: 'Cuerpo de la notificación' })
    @IsString()
    @IsNotEmpty()
    body: string;

    @ApiProperty({ description: 'Datos adicionales JSON' })
    @IsOptional()
    data?: any;
}
