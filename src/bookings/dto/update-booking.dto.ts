import { IsEmail, IsOptional, IsString } from "class-validator";

export class UpdateBookingDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    @IsEmail()
    email?: string;
}