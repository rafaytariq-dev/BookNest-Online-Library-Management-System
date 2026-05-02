import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ContactSubject {
    GENERAL = 'general',
    BOOK_REQUEST = 'book_request',
    ACCOUNT = 'account',
    FEEDBACK = 'feedback',
}

@Entity('contact_messages')
export class ContactMessage {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    email: string;

    @Column({
        type: 'enum',
        enum: ContactSubject,
        default: ContactSubject.GENERAL,
    })
    subject: ContactSubject;

    @Column('text')
    message: string;

    @Column({ default: false })
    resolved: boolean;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ nullable: true })
    userId?: string;

    @CreateDateColumn()
    createdAt: Date;
}
