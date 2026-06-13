import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateAddressDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    alias?: string;

    @ApiProperty()
    @IsString()
    street: string;

    @ApiProperty()
    @IsString()
    number: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    apartment?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    zipCode?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    reference?: string;

    @ApiPropertyOptional({ default: false })
    @IsOptional()
    @IsBoolean()
    isDefault?: boolean;

    @ApiProperty()
    @IsUUID()
    countryId: string;

    @ApiProperty()
    @IsUUID()
    regionId: string;

    @ApiProperty()
    @IsUUID()
    localityId: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    latitude?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    longitude?: number;
}
