import { IsString } from "class-validator";

export class CreateTourDto {
    @IsString()
    title!: string;
}