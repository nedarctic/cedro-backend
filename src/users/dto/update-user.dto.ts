import { IsEmail, IsOptional, IsString } from "class-validator";
import { UserRole } from "../../generated/prisma/enums";

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    password?: string;

    @IsOptional()
    role?: UserRole;

    @IsOptional()
    refreshToken?: string;
}