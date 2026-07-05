import { IsArray, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class UpdateItinerariesDto {
    @IsOptional()
    @IsString()
    id?: string;

    @IsOptional()
    @IsArray()
    @IsString({each: true})
    activities?: string[];

    @IsOptional()
    @IsString()
    subtitle?: string;

    @IsOptional()
    @IsString()
    day?: string;
}

export class UpdateTourDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsArray()
    @IsString({each: true})
    activities?: string[];

    @IsOptional()
    @IsArray()
    @IsString({each: true})
    included?: string[];

    @IsOptional()
    @IsArray()
    @IsString({each: true})
    excluded?: string[];

    @IsOptional()
    @IsString()
    dates?: string;

    @IsOptional()
    @IsString()
    duration?: string;

    @IsOptional()
    @IsString()
    groupSize?: string;

    @IsOptional()
    @IsString()
    price?: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => UpdateItinerariesDto)
    itineraries?: UpdateItinerariesDto[]
}