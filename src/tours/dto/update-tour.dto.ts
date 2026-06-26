import { IsOptional, IsString } from "class-validator";

export class UpdateTourDto {
    @IsOptional()
    @IsString()
    title?: string;
}