import { IsString, IsOptional, IsInt, Max, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class PaginationDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Max(100)
    @Min(10)
    limit?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number;
}