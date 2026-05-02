import { IsDateString, IsInt, IsIn, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReservationDto {
    @IsInt()
    bookId: number;

    @IsDateString()
    pickupDate: string;

    @IsIn([7, 14, 21])
    duration: number;
}

export class CreateReservationItemDto {
    @IsInt()
    bookId: number;

    @IsDateString()
    pickupDate: string;

    @IsIn([7, 14, 21])
    duration: number;
}

export class CreateBulkReservationDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateReservationItemDto)
    items: CreateReservationItemDto[];
}
