import { IsString, MaxLength, MinLength } from 'class-validator';

export class DetectServiceDto {
    @IsString()
    @MinLength(3)
    @MaxLength(300)
    mensaje!: string;

    @IsString()
    countryCode: string = 'cl';
}
