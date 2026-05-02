import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactMessage } from './entities/contact-message.entity';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';

@Injectable()
export class ContactService {
    constructor(
        @InjectRepository(ContactMessage)
        private contactRepository: Repository<ContactMessage>,
    ) {}

    async create(createContactMessageDto: CreateContactMessageDto, userId?: string) {
        const message = this.contactRepository.create({
            ...createContactMessageDto,
            userId: userId,
        });

        await this.contactRepository.save(message);

        // Simulate email confirmation
        console.log(`📧 Contact message received from ${createContactMessageDto.email}`);
        console.log(`   Subject: ${createContactMessageDto.subject}`);
        console.log(`   Message: ${createContactMessageDto.message}`);

        return {
            success: true,
            message: 'Your message has been sent successfully. We will get back to you shortly.',
        };
    }

    async findAll() {
        return this.contactRepository.find({
            order: { createdAt: 'DESC' },
            relations: ['user'],
        });
    }

    async markResolved(id: string) {
        await this.contactRepository.update(id, { resolved: true });
        return { message: 'Message marked as resolved' };
    }
}
