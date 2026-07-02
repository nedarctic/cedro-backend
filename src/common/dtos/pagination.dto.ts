import { IsString, IsOptional, IsInt, Max, Min, IsPositive } from 'class-validator'
import { Type } from 'class-transformer'

export class PaginationDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    @Min(10)
    @Max(100)
    limit?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    page?: number;
}