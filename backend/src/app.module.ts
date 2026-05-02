import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { BooksModule } from './books/books.module';
import { UsersModule } from './users/users.module';
import { ReviewsModule } from './reviews/reviews.module';
import { AuthModule } from './auth/auth.module';
import { ReservationsModule } from './reservations/reservations.module';
import { ContactModule } from './contact/contact.module';
import { SeedModule } from './seed/seed.module';
import { CartModule } from './cart/cart.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => {
        const dbUrl = process.env.DATABASE_URL;

        console.log('🔌 Connecting to Neon PostgreSQL database...');

        if (dbUrl) {
          const url = new URL(dbUrl);
          return {
            type: 'postgres' as const,
            host: url.hostname,
            port: parseInt(url.port) || 5432,
            username: url.username,
            password: url.password,
            database: url.pathname.slice(1),
            autoLoadEntities: true,
            synchronize: true,
            ssl: {
              rejectUnauthorized: false,
            },
            logging: process.env.NODE_ENV === 'development',
          };
        }

        throw new Error('DATABASE_URL is not configured');
      },
      inject: [ConfigService],
    }),
    AuthModule,
    BooksModule,
    UsersModule,
    ReviewsModule,
    ReservationsModule,
    ContactModule,
    SeedModule,
    CartModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
