import { ApiProperty } from '@nestjs/swagger';

export class GeoRegionDto {
    @ApiProperty({ example: 'uuid-here' })
    id: string;

    @ApiProperty({ example: 'LL', description: 'Código interno de la región' })
    code: string;

    @ApiProperty({ example: 'Los Lagos' })
    name: string;
}
