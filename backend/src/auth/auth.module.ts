import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';
import { Session } from './entities/session.entity';
import { SessionAuthGuard } from './guards/session-auth.guard';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Session]),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        {
            provide: APP_GUARD,
            useClass: SessionAuthGuard,
        },
    ],
    exports: [AuthService],
})
export class AuthModule {}
