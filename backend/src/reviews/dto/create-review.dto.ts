import { IsString, IsInt, Min, Max, IsUUID, IsNumber } from 'class-validator';

export class CreateReviewDto {
    @IsInt()
    @Min(1)
    @Max(5)
    rating: number;

    @IsString()
    comment: string;

    @IsString()
    userId: string;

    @IsNumber()
    bookId: number;
}
