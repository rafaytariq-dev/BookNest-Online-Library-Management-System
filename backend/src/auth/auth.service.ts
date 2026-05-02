import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) {}

    async signup(signupDto: SignupDto) {
        const { name, email, password } = signupDto;

        // Check if user already exists
        const existingUser = await this.usersRepository.findOne({ where: { email } });
        if (existingUser) {
            throw new ConflictException('Email already registered');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate member ID
        const userCount = await this.usersRepository.count();
        const memberId = `MEM-${new Date().getFullYear()}-${String(userCount + 1).padStart(3, '0')}`;

        // Create user
        const user = this.usersRepository.create({
            name,
            email,
            password: hashedPassword,
            role: 'USER',
            memberId,
            themePreference: 'light',
        });

        await this.usersRepository.save(user);

        // Return user without password
        const { password: _, ...userWithoutPassword } = user;
        return {
            success: true,
            user: userWithoutPassword,
        };
    }

    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;

        // Find user by email
        const user = await this.usersRepository.findOne({ where: { email } });
        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid email or password');
        }

        // Return user without password
        const { password: _, ...userWithoutPassword } = user;
        return {
            success: true,
            user: userWithoutPassword,
        };
    }

    async validateUser(userId: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { id: userId } });
    }

    async getProfile(userId: string) {
        const user = await this.usersRepository.findOne({ 
            where: { id: userId },
            relations: ['wishlist']
        });
        
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}
