import { ArrayMinSize, IsArray, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateTourDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description!: string;

    @IsOptional()
    @IsArray()
    @ArrayMinSize(1)
    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    activities!: string[];

    @IsOptional()
    @IsArray()
    @ArrayMinSize(1)
    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    included!: string[];

    @IsOptional()
    @IsArray()
    @ArrayMinSize(1)
    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    excluded!: string[];

    @IsOptional()
    @IsString()
    dates!: string;

    @IsOptional()
    @IsString()
    groupSize!: string;

    @IsOptional()
    @IsString()
    price!: string;

    @IsOptional()
    @IsString()
    duration!: string;
}