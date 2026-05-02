import { Controller, Post, Body, Get, HttpCode, HttpStatus, Req, Res, Session } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { Public } from './decorators/public.decorator';

// Extend express-session types
declare module 'express-session' {
    interface SessionData {
        user: {
            id: string;
            email: string;
            name: string;
            role: string;
            memberId: string;
        };
    }
}

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Public()
    @Post('signup')
    @HttpCode(HttpStatus.CREATED)
    async signup(
        @Body() signupDto: SignupDto,
        @Req() req: Request,
    ) {
        const result = await this.authService.signup(signupDto);
        
        // Store user in session and ensure it's saved
        return new Promise((resolve, reject) => {
            req.session.user = {
                id: result.user.id,
                email: result.user.email,
                name: result.user.name,
                role: result.user.role,
                memberId: result.user.memberId,
            };
            
            req.session.save((err) => {
                if (err) {
                    reject({ success: false, message: 'Failed to save session' });
                } else {
                    resolve(result);
                }
            });
        });
    }

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(
        @Body() loginDto: LoginDto,
        @Req() req: Request,
    ) {
        const result = await this.authService.login(loginDto);
        
        // Store user in session and ensure it's saved
        return new Promise((resolve, reject) => {
            req.session.user = {
                id: result.user.id,
                email: result.user.email,
                name: result.user.name,
                role: result.user.role,
                memberId: result.user.memberId,
            };
            
            req.session.save((err) => {
                if (err) {
                    reject({ success: false, message: 'Failed to save session' });
                } else {
                    resolve(result);
                }
            });
        });
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    logout(@Req() req: Request) {
        return new Promise((resolve, reject) => {
            req.session.destroy((err) => {
                if (err) {
                    reject({ success: false, message: 'Failed to logout' });
                } else {
                    resolve({ success: true, message: 'Logged out successfully' });
                }
            });
        });
    }

    @Get('profile')
    async getProfile(@Req() req: Request) {
        return this.authService.getProfile(req.session.user!.id);
    }

    @Public()
    @Get('session')
    checkSession(@Req() req: Request) {
        if (req.session?.user) {
            return { 
                success: true, 
                authenticated: true,
                user: req.session.user,
            };
        }
        return { 
            success: true, 
            authenticated: false,
            user: null,
        };
    }
}
