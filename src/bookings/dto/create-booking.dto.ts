import { IsEmail, IsString } from "class-validator";

export class CreateBookingDto {
    @IsString()
    name!: string;

    @IsString()
    @IsEmail()
    email!: string;
}