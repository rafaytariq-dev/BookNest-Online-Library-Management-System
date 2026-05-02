import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables before anything else
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { DataSource } from 'typeorm';
import { TypeOrmStore } from './auth/session.store';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get the TypeORM DataSource for session storage
  const dataSource = app.get(DataSource);

  // Enable cookie parsing
  app.use(cookieParser());

  // Configure session middleware
  app.use(
    session({
      store: new TypeOrmStore(dataSource),
      secret: process.env.SESSION_SECRET || 'booknest-session-secret-2024',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      },
      name: 'booknest.sid',
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global validation pipe for DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  // Global prefix for all API routes
  app.setGlobalPrefix('api');

  // Enable CORS for frontend integration
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 BookNest API is running on: http://localhost:${port}/api`);
}
bootstrap();
