import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class QueryRatingsDto {
    @ApiPropertyOptional({ default: 1 })
    @IsOptional()
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ default: 10 })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 10;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    query?: string;
}
