import { Controller, Get, Post, Body, Patch, Delete, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // User profile routes
  @Get('me')
  getMe(@CurrentUser() user: any) {
    return this.usersService.findOne(user.id);
  }

  @Patch('me')
  updateMe(@CurrentUser() user: any, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(user.id, updateUserDto);
  }

  // Dashboard route
  @Get('dashboard')
  getDashboard(@CurrentUser() user: any) {
    return this.usersService.getDashboardData(user.id);
  }

  // Theme routes
  @Get('theme')
  getTheme(@CurrentUser() user: any) {
    return this.usersService.getTheme(user.id);
  }

  @Patch('theme')
  updateTheme(@CurrentUser() user: any, @Body('theme') theme: 'light' | 'dark') {
    return this.usersService.updateTheme(user.id, theme);
  }

  // Wishlist endpoints (must be BEFORE :id routes to avoid conflicts)
  @Get('wishlist')
  getWishlist(@CurrentUser() user: any) {
    return this.usersService.getWishlist(user.id);
  }

  @Post('wishlist')
  @HttpCode(HttpStatus.CREATED)
  addToWishlist(@CurrentUser() user: any, @Body('bookId') bookId: number) {
    return this.usersService.addToWishlist(user.id, bookId);
  }

  @Delete('wishlist/:bookId')
  @HttpCode(HttpStatus.OK)
  removeFromWishlist(@CurrentUser() user: any, @Param('bookId') bookId: string) {
    return this.usersService.removeFromWishlist(user.id, +bookId);
  }
}
