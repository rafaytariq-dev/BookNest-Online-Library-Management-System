import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn, Unique } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Book } from '../../books/entities/book.entity';

@Entity('reviews')
@Unique(['userId', 'bookId']) // Prevent multiple reviews per user per book
export class Review {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('int')
    rating: number; // 1-5

    @Column('text')
    comment: string;

    @ManyToOne(() => User, (user) => user.reviews)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    userId: string;

    @ManyToOne(() => Book, (book) => book.reviews)
    @JoinColumn({ name: 'bookId' })
    book: Book;

    @Column()
    bookId: number;

    @CreateDateColumn()
    date: Date;
}
