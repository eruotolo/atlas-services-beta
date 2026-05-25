import { ApiProperty } from '@nestjs/swagger';

export class GeoLocalityDto {
    @ApiProperty({ example: 'uuid-here' })
    id: string;

    @ApiProperty({ example: 'castro', description: 'Slug URL-safe' })
    slug: string;

    @ApiProperty({ example: 'Castro' })
    name: string;
}
