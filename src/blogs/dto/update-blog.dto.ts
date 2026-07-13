import { Type } from "class-transformer";
import { IsOptional, IsString, ValidateNested } from "class-validator";

export class SectionDto {

    @IsString()
    id!: string;

    @IsOptional()
    @IsString()
    section?: string;

    @IsOptional()
    @IsString()
    subtitle?: string;

    @IsOptional()
    @IsString()
    content?: string;

    @IsOptional()
    @IsString()
    sectionImageKey?: string;

    @IsOptional()
    @IsString()
    sectionImageUrl?: string;
}

export class UpdateBlogDto {

    @IsString()
    title!: string;

    @IsString()
    intro!: string;

    @IsString()
    conclusion!: string;

    @ValidateNested()
    @Type(() => SectionDto)
    sections!: SectionDto[];
}