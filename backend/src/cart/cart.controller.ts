import { Controller, Get, Post, Body, Delete, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { CartService } from './cart.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('cart')
export class CartController {
    constructor(private readonly cartService: CartService) { }

    @Get()
    getCart(@CurrentUser() user: any) {
        return this.cartService.getCart(user.id);
    }

    @Post()
    @HttpCode(HttpStatus.OK)
    addToCart(
        @CurrentUser() user: any,
        @Body() body: { bookId: number; pickupDate: string; duration: number },
    ) {
        return this.cartService.addToCart(user.id, body.bookId, body.pickupDate, body.duration);
    }

    @Delete(':id')
    removeFromCart(@CurrentUser() user: any, @Param('id') id: string) {
        return this.cartService.removeFromCart(user.id, id);
    }

    @Delete()
    clearCart(@CurrentUser() user: any) {
        return this.cartService.clearCart(user.id);
    }
}
