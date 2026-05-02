import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { CartItem } from './entities/cart-item.entity';
import { Book } from '../books/entities/book.entity';
import { Reservation } from '../reservations/entities/reservation.entity';

@Module({
    imports: [TypeOrmModule.forFeature([CartItem, Book, Reservation])],
    controllers: [CartController],
    providers: [CartService],
    exports: [CartService],
})
export class CartModule { }
