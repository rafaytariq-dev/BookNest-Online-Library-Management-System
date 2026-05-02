import { Entity, Column, PrimaryColumn, Index } from 'typeorm';

@Entity('sessions')
export class Session {
    @PrimaryColumn('varchar', { length: 255 })
    id: string;

    @Column('text')
    json: string;

    @Index()
    @Column('bigint')
    expiredAt: number;
}
