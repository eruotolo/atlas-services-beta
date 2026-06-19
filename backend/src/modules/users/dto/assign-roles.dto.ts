import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    ArrayNotEmpty,
    IsArray,
    IsOptional,
    IsString,
    Length,
    ValidateNested,
} from 'class-validator';

export class AssignRoleItemDto {
    @ApiProperty({ description: 'ID del rol a asignar' })
    @IsString()
    roleId: string;

    @ApiPropertyOptional({
        description: 'Código ISO2 del país (obligatorio para el rol Administrador)',
        example: 'cl',
    })
    @IsOptional()
    @IsString()
    @Length(2, 2)
    countryCode?: string;
}

export class AssignRolesDto {
    @ApiProperty({ type: [AssignRoleItemDto] })
    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => AssignRoleItemDto)
    roles: AssignRoleItemDto[];
}
