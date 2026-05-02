import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './entities/cart-item.entity';
import { Book } from '../books/entities/book.entity';
import { Reservation, ReservationStatus } from '../reservations/entities/reservation.entity';
import { In } from 'typeorm';

@Injectable()
export class CartService {
    constructor(
        @InjectRepository(CartItem)
        private cartRepository: Repository<CartItem>,
        @InjectRepository(Book)
        private booksRepository: Repository<Book>,
        @InjectRepository(Reservation)
        private reservationsRepository: Repository<Reservation>,
    ) { }

    async getCart(userId: string) {
        const items = await this.cartRepository.find({
            where: { userId },
            relations: ['book'],
            order: { createdAt: 'ASC' },
        });

        return items.map(item => ({
            id: item.bookId,
            reservationId: item.id,
            title: item.book.title,
            author: item.book.author,
            cover: item.book.cover,
            pickupDate: item.pickupDate,
            duration: item.duration,
        }));
    }

    async addToCart(userId: string, bookId: number, pickupDate: string, duration: number) {
        // Validation logic
        const book = await this.booksRepository.findOne({ where: { id: bookId } });
        if (!book) throw new NotFoundException('Book not found');

        // Check total limit (cart + active reservations <= 5)
        const cartCount = await this.cartRepository.count({ where: { userId } });
        const activeResCount = await this.reservationsRepository.count({
            where: {
                userId,
                status: In([ReservationStatus.RESERVED, ReservationStatus.PICKEDUP]),
            },
        });

        if (cartCount + activeResCount >= 5) {
            throw new BadRequestException('You cannot reserve or borrow more than 5 books in total.');
        }

        // Check if already in cart
        const existingCartItem = await this.cartRepository.findOne({ where: { userId, bookId } });
        if (existingCartItem) {
            throw new BadRequestException('You already have this book in your cart.');
        }

        // Check if already borrowed/reserved
        const existingRes = await this.reservationsRepository.findOne({
            where: {
                userId,
                bookId,
                status: In([ReservationStatus.RESERVED, ReservationStatus.PICKEDUP]),
            },
        });
        if (existingRes) {
            throw new BadRequestException('You have already borrowed or reserved this book.');
        }

        const item = this.cartRepository.create({
            userId,
            bookId,
            pickupDate: new Date(pickupDate),
            duration,
        });

        await this.cartRepository.save(item);
        return this.getCart(userId);
    }

    async removeFromCart(userId: string, itemId: string) {
        await this.cartRepository.delete({ id: itemId, userId });
        return this.getCart(userId);
    }

    async clearCart(userId: string) {
        await this.cartRepository.delete({ userId });
        return { success: true };
    }
}
