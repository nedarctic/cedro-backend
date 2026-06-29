import { ArrayMinSize, IsArray, IsNotEmpty, IsString } from "class-validator";

export class CreateTourDto {
    @IsString()
    title!: string;

    @IsString()
    description!: string;

    @IsArray()
    @ArrayMinSize(1)
    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    activities!: string[];

    @IsArray()
    @ArrayMinSize(1)
    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    included!: string[];

    @IsArray()
    @ArrayMinSize(1)
    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    excluded!: string[];

    @IsString()
    dates!: string;

    @IsString()
    groupSize!: string;

    @IsString()
    price!: string;

    @IsString()
    duration!: string;
}