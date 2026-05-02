import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { Book } from '../books/entities/book.entity';
import { User } from '../users/entities/user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Book, User])],
    providers: [SeedService],
    exports: [SeedService],
})
export class SeedModule {}
