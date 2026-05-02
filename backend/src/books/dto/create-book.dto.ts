import { IsString, IsInt, IsOptional, IsNumber, IsBoolean, Min, Max } from 'class-validator';

export class CreateBookDto {
    @IsString()
    title: string;

    @IsString()
    author: string;

    @IsString()
    isbn: string;

    @IsString()
    genre: string;

    @IsInt()
    @Min(0)
    totalCopies: number;

    @IsInt()
    @Min(0)
    availableCopies: number;

    @IsString()
    cover: string;

    @IsString()
    @IsOptional()
    publisher?: string;

    @IsInt()
    @IsOptional()
    year?: number;

    @IsInt()
    @IsOptional()
    pages?: number;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    @IsOptional()
    @Min(0)
    @Max(5)
    rating?: number;

    @IsBoolean()
    @IsOptional()
    isFeatured?: boolean;

    @IsBoolean()
    @IsOptional()
    isNewArrival?: boolean;
}
