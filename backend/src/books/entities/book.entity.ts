import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Review } from '../../reviews/entities/review.entity';
import { Reservation } from '../../reservations/entities/reservation.entity';

@Entity('books')
export class Book {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    title: string;

    @Column()
    author: string;

    @Column({ unique: true })
    isbn: string;

    @Column()
    genre: string;

    @Column('int')
    totalCopies: number;

    @Column('int')
    availableCopies: number;

    @Column()
    cover: string;

    @Column({ nullable: true })
    publisher: string;

    @Column('int', { nullable: true })
    year: number;

    @Column('int', { nullable: true })
    pages: number;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column('decimal', { precision: 3, scale: 1, default: 0 })
    rating: number;

    @Column({ default: false })
    isFeatured: boolean;

    @Column({ default: false })
    isNewArrival: boolean;

    @OneToMany(() => Review, (review) => review.book)
    reviews: Review[];

    @OneToMany(() => Reservation, (reservation) => reservation.book)
    reservations: Reservation[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
