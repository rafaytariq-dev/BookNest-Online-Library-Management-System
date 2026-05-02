import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('contact')
export class ContactController {
    constructor(private readonly contactService: ContactService) {}

    @Public()
    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createContactMessageDto: CreateContactMessageDto, @CurrentUser() user?: any) {
        return this.contactService.create(createContactMessageDto, user?.id);
    }
}
