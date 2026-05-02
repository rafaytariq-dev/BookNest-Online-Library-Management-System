import { IsString, IsEmail, MinLength, IsOptional } from 'class-validator';

export class CreateUserDto {
    @IsString()
    name: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsOptional()
    @IsString()
    role?: string;

    @IsString()
    @IsOptional()
    memberId?: string;
}
