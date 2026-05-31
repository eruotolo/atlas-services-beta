import { ApiPropertyOptional } from '@nestjs/swagger';
import { CommentStatus } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateRatingDto {
    @ApiPropertyOptional({ example: 4, minimum: 1, maximum: 5 })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(5)
    estrellas?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    comentario?: string;

    @ApiPropertyOptional({ enum: CommentStatus })
    @IsOptional()
    @IsEnum(CommentStatus)
    estado?: CommentStatus;
}
