import { ArrayMinSize, IsArray, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateItineraryDto {
    @IsOptional()
    @IsString()
    subtitle?: string;

    @IsOptional()
    @IsString()
    day?: string;

    @IsOptional()
    @IsArray()
    @ArrayMinSize(1)
    @IsNotEmpty({ each: true })
    @IsString({ each: true })
    activities!: string[];
}