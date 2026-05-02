import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Book } from '../../books/entities/book.entity';

@Entity('cart_items')
export class CartItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    bookId: number;

    @ManyToOne(() => Book)
    @JoinColumn({ name: 'bookId' })
    book: Book;

    @Column({ type: 'date' })
    pickupDate: Date;

    @Column('int')
    duration: number;

    @CreateDateColumn()
    createdAt: Date;
}
