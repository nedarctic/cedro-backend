import { IsOptional, IsString } from "class-validator";

export class UpdateMemberDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    designation?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    level?: string;
}