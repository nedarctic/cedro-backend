import { IsString } from "class-validator";

export class CreateMemberDto {
    @IsString()
    name!: string;

    @IsString()
    designation!: string;

    @IsString()
    description!: string;

    @IsString()
    level!: string;
}