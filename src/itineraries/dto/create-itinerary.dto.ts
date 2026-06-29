import { ArrayMinSize, IsArray, IsNotEmpty, IsString } from "class-validator";

export class CreateItineraryDto {
    @IsString()
    subtitle!: string;

    @IsString()
    day!: string;

    @IsArray()
    @ArrayMinSize(1)
    @IsNotEmpty({each: true})
    @IsString({each: true})
    activities!: string[];
}