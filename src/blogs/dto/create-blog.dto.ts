import { ArrayNotEmpty, IsArray, IsString } from "class-validator";

export class CreateBlogDto {
    @IsString()
    title!: string;

    @IsString()
    intro!: string;

    @IsString()
    conclusion!: string;

    @IsArray()
    @ArrayNotEmpty()
    sections!: {
        id: string;
        section: string;
        subtitle: string;
        content: string;
    }[];
}