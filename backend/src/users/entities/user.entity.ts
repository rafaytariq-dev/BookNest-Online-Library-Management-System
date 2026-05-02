import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Book } from '../../books/entities/book.entity';
import { Review } from '../../reviews/entities/review.entity';
import { Reservation } from '../../reservations/entities/reservation.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ default: 'USER' })
    role: string;

    @Column({ unique: true })
    memberId: string;

    @Column({ default: 'light' })
    themePreference: string;

    @ManyToMany(() => Book, { eager: false })
    @JoinTable({
        name: 'user_wishlist',
        joinColumn: { name: 'user_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'book_id', referencedColumnName: 'id' }
    })
    wishlist: Book[];

    @OneToMany(() => Review, (review) => review.user)
    reviews: Review[];

    @OneToMany(() => Reservation, (reservation) => reservation.user)
    reservations: Reservation[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
