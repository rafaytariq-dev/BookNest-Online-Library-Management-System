import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, LessThan, MoreThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Reservation, ReservationStatus } from './entities/reservation.entity';
import { Book } from '../books/entities/book.entity';
import { User } from '../users/entities/user.entity';
import { CreateReservationDto, CreateBulkReservationDto } from './dto/create-reservation.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ReservationsService {
    constructor(
        @InjectRepository(Reservation)
        private reservationsRepository: Repository<Reservation>,
        @InjectRepository(Book)
        private booksRepository: Repository<Book>,
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) {}

    private generateReservationCode(): string {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.random().toString(36).substring(2, 5).toUpperCase();
        return `RES-${timestamp}-${random}`;
    }

    private calculateDueDate(pickupDate: string, duration: number): Date {
        const date = new Date(pickupDate);
        date.setDate(date.getDate() + duration);
        return date;
    }

    async create(userId: string, createReservationDto: CreateReservationDto) {
        // Validate user
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Validate book
        const book = await this.booksRepository.findOne({ where: { id: createReservationDto.bookId } });
        if (!book) {
            throw new NotFoundException('Book not found');
        }

        // Check available copies
        if (book.availableCopies <= 0) {
            throw new BadRequestException('No copies available for this book');
        }

        // Check max 5 active reservations
        const activeReservations = await this.reservationsRepository.count({
            where: {
                userId,
                status: In([ReservationStatus.RESERVED, ReservationStatus.PICKEDUP]),
            },
        });

        if (activeReservations >= 5) {
            throw new BadRequestException('You cannot have more than 5 active reservations');
        }

        // Check if already has this book reserved/borrowed
        const existingReservation = await this.reservationsRepository.findOne({
            where: {
                userId,
                bookId: createReservationDto.bookId,
                status: In([ReservationStatus.RESERVED, ReservationStatus.PICKEDUP]),
            },
        });

        if (existingReservation) {
            throw new ConflictException('You already have this book reserved or borrowed');
        }

        // Validate pickup date (must be today or future)
        const pickupDate = new Date(createReservationDto.pickupDate);
        pickupDate.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (pickupDate < today) {
            throw new BadRequestException('Pickup date cannot be in the past');
        }

        // Validate duration
        if (![7, 14, 21].includes(createReservationDto.duration)) {
            throw new BadRequestException('Duration must be 7, 14, or 21 days');
        }

        // Calculate due date
        const dueDate = this.calculateDueDate(createReservationDto.pickupDate, createReservationDto.duration);

        // Create reservation
        const reservation = this.reservationsRepository.create({
            reservationCode: this.generateReservationCode(),
            pickupDate: new Date(createReservationDto.pickupDate),
            duration: createReservationDto.duration,
            dueDate,
            status: ReservationStatus.RESERVED,
            userId,
            bookId: createReservationDto.bookId,
        });

        await this.reservationsRepository.save(reservation);

        // Update book available copies
        await this.booksRepository.update(book.id, {
            availableCopies: book.availableCopies - 1,
        });

        // Fetch with relations
        return this.reservationsRepository.findOne({
            where: { id: reservation.id },
            relations: ['book', 'user'],
        });
    }

    async createBulk(userId: string, createBulkReservationDto: CreateBulkReservationDto) {
        const results: Reservation[] = [];
        const errors: { bookId: number; error: string }[] = [];

        // Validate user first
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Check total active reservations
        const activeReservations = await this.reservationsRepository.count({
            where: {
                userId,
                status: In([ReservationStatus.RESERVED, ReservationStatus.PICKEDUP]),
            },
        });

        if (activeReservations + createBulkReservationDto.items.length > 5) {
            throw new BadRequestException(
                `Cannot create ${createBulkReservationDto.items.length} reservations. ` +
                `You have ${activeReservations} active reservations. Maximum allowed is 5.`
            );
        }

        for (const item of createBulkReservationDto.items) {
            try {
                const reservation = await this.create(userId, item);
                if (reservation) {
                    results.push(reservation);
                }
            } catch (error: any) {
                errors.push({ bookId: item.bookId, error: error.message });
            }
        }

        // Collect all reservationCodes for this bulk operation
        const reservationCodes = results.map(r => r.reservationCode).join(',');
        // For display, use the first reservation's code (or empty string)
        const reservationId = results.length > 0 ? results[0].reservationCode : '';
        return {
            success: errors.length === 0,
            reservationId, // for display and QR
            reservationCodes, // for QR if needed
            reservations: results,
            errors: errors.length > 0 ? errors : undefined,
        };
    }

    async findAll(userId: string) {
        return this.reservationsRepository.find({
            where: { userId },
            relations: ['book'],
            order: { createdAt: 'DESC' },
        });
    }

    async findActive(userId: string) {
        const reservations = await this.reservationsRepository.find({
            where: {
                userId,
                status: In([ReservationStatus.RESERVED, ReservationStatus.PICKEDUP]),
            },
            relations: ['book'],
            order: { createdAt: 'DESC' },
        });

        return reservations.map(res => this.formatReservation(res));
    }

    async findHistory(userId: string) {
        const reservations = await this.reservationsRepository.find({
            where: {
                userId,
                status: In([ReservationStatus.RETURNED, ReservationStatus.CANCELLED, ReservationStatus.EXPIRED]),
            },
            relations: ['book'],
            order: { updatedAt: 'DESC' },
        });

        return reservations.map(res => ({
            ...this.formatReservation(res),
            returnedDate: res.returnedAt,
        }));
    }

    async findOne(id: string, userId: string) {
        const reservation = await this.reservationsRepository.findOne({
            where: { id, userId },
            relations: ['book', 'user'],
        });

        if (!reservation) {
            throw new NotFoundException('Reservation not found');
        }

        return this.formatReservation(reservation);
    }

    async pickup(id: string, userId: string) {
        const reservation = await this.reservationsRepository.findOne({
            where: { id, userId },
            relations: ['book'],
        });

        if (!reservation) {
            throw new NotFoundException('Reservation not found');
        }

        if (reservation.status !== ReservationStatus.RESERVED) {
            throw new BadRequestException('Only reserved books can be picked up');
        }

        // Check if pickup date is today or past
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const pickupDate = new Date(reservation.pickupDate);
        pickupDate.setHours(0, 0, 0, 0);

        if (pickupDate > today) {
            const formattedDate = pickupDate.toISOString().split('T')[0];
            throw new BadRequestException(`Book can only be picked up on or after ${formattedDate}`);
        }

        await this.reservationsRepository.update(id, {
            status: ReservationStatus.PICKEDUP,
            pickedUpAt: new Date(),
        });

        return this.reservationsRepository.findOne({
            where: { id },
            relations: ['book'],
        });
    }

    async cancel(id: string, userId: string) {
        const reservation = await this.reservationsRepository.findOne({
            where: { id, userId },
            relations: ['book'],
        });

        if (!reservation) {
            throw new NotFoundException('Reservation not found');
        }

        if (reservation.status !== ReservationStatus.RESERVED) {
            throw new BadRequestException('Only reserved books can be cancelled');
        }

        await this.reservationsRepository.update(id, {
            status: ReservationStatus.CANCELLED,
        });

        // Restore book availability
        await this.booksRepository.update(reservation.bookId, {
            availableCopies: reservation.book.availableCopies + 1,
        });

        return { message: 'Reservation cancelled successfully' };
    }

    async return(id: string, userId: string) {
        const reservation = await this.reservationsRepository.findOne({
            where: { id, userId },
            relations: ['book'],
        });

        if (!reservation) {
            throw new NotFoundException('Reservation not found');
        }

        if (reservation.status !== ReservationStatus.PICKEDUP) {
            throw new BadRequestException('Only picked up books can be returned');
        }

        // Calculate fine if overdue
        const today = new Date();
        const dueDate = new Date(reservation.dueDate);
        let fineAmount = 0;

        if (today > dueDate) {
            const daysOverdue = Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
            fineAmount = daysOverdue * 2; // $2 per day
        }

        await this.reservationsRepository.update(id, {
            status: ReservationStatus.RETURNED,
            returnedAt: new Date(),
            fineAmount,
        });

        // Restore book availability
        await this.booksRepository.update(reservation.bookId, {
            availableCopies: reservation.book.availableCopies + 1,
        });

        return { 
            message: 'Book returned successfully',
            fineAmount: fineAmount > 0 ? fineAmount : undefined,
        };
    }

    async extend(id: string, userId: string) {
        const reservation = await this.reservationsRepository.findOne({
            where: { id, userId },
            relations: ['book'],
        });

        if (!reservation) {
            throw new NotFoundException('Reservation not found');
        }

        if (reservation.status !== ReservationStatus.PICKEDUP) {
            throw new BadRequestException('Only picked up books can be extended');
        }

        if (reservation.extended) {
            throw new BadRequestException('This loan has already been extended once');
        }

        // Check if there are pending reservations for this book
        const pendingReservations = await this.reservationsRepository.count({
            where: {
                bookId: reservation.bookId,
                status: ReservationStatus.RESERVED,
            },
        });

        if (pendingReservations > 0) {
            throw new BadRequestException('Cannot extend - there are pending reservations for this book');
        }

        // Extend by 7 days
        const newDueDate = new Date(reservation.dueDate);
        newDueDate.setDate(newDueDate.getDate() + 7);

        await this.reservationsRepository.update(id, {
            dueDate: newDueDate,
            extended: true,
        });

        return this.reservationsRepository.findOne({
            where: { id },
            relations: ['book'],
        });
    }

    async getStats(userId: string) {
        const active = await this.reservationsRepository.count({
            where: {
                userId,
                status: In([ReservationStatus.RESERVED, ReservationStatus.PICKEDUP]),
            },
        });

        const lifetime = await this.reservationsRepository.count({
            where: { userId },
        });

        const returned = await this.reservationsRepository.count({
            where: {
                userId,
                status: ReservationStatus.RETURNED,
            },
        });

        return {
            activeLoans: active,
            lifetimeBorrowed: returned,
            currentReservations: active,
        };
    }

    private formatReservation(reservation: Reservation) {
        const now = new Date();
        const dueDate = new Date(reservation.dueDate);
        const isOverdue = reservation.status === ReservationStatus.PICKEDUP && now > dueDate;
        const daysRemaining = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        return {
            id: reservation.id,
            reservationId: reservation.reservationCode,
            reservationCode: reservation.reservationCode,
            bookId: reservation.bookId,
            title: reservation.book?.title,
            author: reservation.book?.author,
            cover: reservation.book?.cover,
            pickupDate: reservation.pickupDate,
            duration: reservation.duration,
            dueDate: reservation.dueDate,
            status: reservation.status,
            extended: reservation.extended,
            isOverdue,
            daysRemaining: reservation.status === ReservationStatus.PICKEDUP ? daysRemaining : null,
            fineAmount: isOverdue ? Math.abs(daysRemaining) * 2 : 0,
            createdAt: reservation.createdAt,
        };
    }

    // Scheduled task to expire unpicked reservations
    @Cron(CronExpression.EVERY_HOUR)
    async expireReservations() {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const expiredReservations = await this.reservationsRepository.find({
            where: {
                status: ReservationStatus.RESERVED,
                pickupDate: LessThan(yesterday),
            },
            relations: ['book'],
        });

        for (const reservation of expiredReservations) {
            await this.reservationsRepository.update(reservation.id, {
                status: ReservationStatus.EXPIRED,
            });

            // Restore book availability
            await this.booksRepository.update(reservation.bookId, {
                availableCopies: reservation.book.availableCopies + 1,
            });
        }

        if (expiredReservations.length > 0) {
            console.log(`Expired ${expiredReservations.length} reservations`);
        }
    }
}
