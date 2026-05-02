import { IsEmail, IsString, IsEnum, IsOptional } from 'class-validator';
import { ContactSubject } from '../entities/contact-message.entity';

export class CreateContactMessageDto {
    @IsString()
    name: string;

    @IsEmail()
    email: string;

    @IsEnum(ContactSubject)
    subject: ContactSubject;

    @IsString()
    message: string;
}
