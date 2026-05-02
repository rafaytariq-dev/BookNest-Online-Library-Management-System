import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Book } from '../../books/entities/book.entity';

export enum ReservationStatus {
    RESERVED = 'Reserved',
    PICKEDUP = 'PickedUp',
    RETURNED = 'Returned',
    CANCELLED = 'Cancelled',
    EXPIRED = 'Expired',
}

@Entity('reservations')
export class Reservation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    reservationCode: string;

    @Column({ type: 'date' })
    pickupDate: Date;

    @Column('int')
    duration: number; // 7, 14, or 21 days

    @Column({ type: 'date' })
    dueDate: Date;

    @Column({ type: 'timestamp', nullable: true })
    pickedUpAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    returnedAt: Date;

    @Column({
        type: 'enum',
        enum: ReservationStatus,
        default: ReservationStatus.RESERVED,
    })
    status: ReservationStatus;

    @Column({ default: false })
    extended: boolean;

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    fineAmount: number;

    @ManyToOne(() => User, (user) => user.reservations)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    userId: string;

    @ManyToOne(() => Book, (book) => book.reservations)
    @JoinColumn({ name: 'bookId' })
    book: Book;

    @Column()
    bookId: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
